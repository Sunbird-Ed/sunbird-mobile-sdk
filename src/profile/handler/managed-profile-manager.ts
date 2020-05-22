import {AddManagedProfileRequest} from '../def/add-managed-profile-request';
import {defer, Observable} from 'rxjs';
import {NoActiveSessionError, Profile, ProfileService, ProfileServiceConfig, ProfileSource, ProfileType, ServerProfile} from '..';
import {CsRequest} from '@project-sunbird/client-services/core/http-service';
import {ApiService, HttpRequestType} from '../../api';
import {UniqueId} from '../../db/util/unique-id';
import {AuthService} from '../../auth';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {GetManagedServerProfilesRequest} from '../def/get-managed-server-profiles-request';

export class ManagedProfileManager {
    private static readonly MANGED_SERVER_PROFILES_LOCAL_KEY = 'managed_server_profiles-';

    constructor(
        private profileService: ProfileService,
        private authService: AuthService,
        private profileServiceConfig: ProfileServiceConfig,
        private apiService: ApiService,
        private cachedItemStore: CachedItemStore,
    ) {
    }

    addManagedProfile(request: AddManagedProfileRequest): Observable<Profile> {
        return defer(async () => {
            if (!(await this.isLoggedInUser())) {
                throw new NoActiveSessionError('No active LoggedIn Session found');
            }

            const {uid} = await this.createManagedProfile(request);

            await this.updateTnCForManagedProfile(uid);

            return await this.profileService.createProfile({
                uid: uid,
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                handle: request.name,
                board: request.board,
                medium: request.medium,
                grade: request.grade,
                serverProfile: {} as any
            }, ProfileSource.SERVER).toPromise();
        });
    }

    getManagedServerProfiles(request: GetManagedServerProfilesRequest): Observable<ServerProfile[]> {
        return defer(async () => {
            if (!(await this.isLoggedInUser())) {
                throw new NoActiveSessionError('No active LoggedIn Session found');
            }

            const profile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();

            const managedByUid: string = (profile.serverProfile && profile.serverProfile['managedBy']) ? profile.serverProfile['managedBy'] : profile.uid;

            const fetchFromServer = () => {
                return defer(async () => {
                    const searchManagedProfilesRequest = new CsRequest.Builder()
                        .withType(HttpRequestType.GET)
                        .withPath(this.profileServiceConfig.profileApiPath + '/search')
                        .withBearerToken(true)
                        .withUserToken(true)
                        .withBody({
                            'request': {
                                'filters': {
                                    'managedBy': managedByUid
                                },
                                'offset': 0,
                                'limit': 20
                            }
                        })
                        .build();

                    return await this.apiService.fetch<{ result: { response: { content: ServerProfile[] } } }>(searchManagedProfilesRequest).toPromise()
                        .then((response) => response.body.result.response.content);
                });
            };

            return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
                managedByUid,
                ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                'ttl_' + ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                () => fetchFromServer(),
            ).toPromise();
        });
    }

    private async createManagedProfile(addManagedProfileRequest: AddManagedProfileRequest): Promise<{ uid: string }> {
        const currentProfile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();

        if (currentProfile.source !== ProfileSource.SERVER) {
            throw new NoActiveSessionError('No active session available');
        }

        const createManagedProfileRequest = new CsRequest.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.profileApiPath + '/create')
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({
                request: {
                    userName: UniqueId.generateUniqueId(), // todo userName should not be required
                    firstName: addManagedProfileRequest.name,
                    managedBy: currentProfile.uid
                }
            })
            .build();

        return await this.apiService.fetch<{ result: { userId: string } }>(createManagedProfileRequest).toPromise()
            .then((response) => ({uid: response.body.result.userId}));
    }

    private async updateTnCForManagedProfile(uid: string): Promise<void> {
        const serverProfile: ServerProfile = await this.profileService.getServerProfilesDetails({
            userId: uid,
            requiredFields: []
        }).toPromise();

        await this.profileService.acceptTermsAndConditions({version: serverProfile.tncLatestVersion}).toPromise();
    }

    private async isLoggedInUser(): Promise<boolean> {
        return !!(await this.authService.getSession().toPromise());
    }
}
