import {AddManagedProfileRequest} from '../def/add-managed-profile-request';
import {defer, Observable, Subject, throwError} from 'rxjs';
import {
    NoActiveSessionError,
    NoProfileFoundError,
    Profile,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    ProfileType,
    ServerProfile
} from '..';
import {ApiService, HttpRequestType, Request} from '../../api';
import {AuthService, OAuthSession, SessionProvider} from '../../auth';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {GetManagedServerProfilesRequest} from '../def/get-managed-server-profiles-request';
import {catchError, mapTo, mergeMap, startWith} from 'rxjs/operators';
import {ProfileEntry} from '../db/schema';
import {DbService} from '../../db';
import {ProfileDbEntryMapper} from '../util/profile-db-entry-mapper';
import {FrameworkService} from '../../framework';
import {ProfileKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';

export class ManagedProfileManager {
    private static readonly MANGED_SERVER_PROFILES_LOCAL_KEY = 'managed_server_profiles-';
    private managedProfileAdded$ = new Subject<undefined>();

    constructor(
        private profileService: ProfileService,
        private authService: AuthService,
        private profileServiceConfig: ProfileServiceConfig,
        private apiService: ApiService,
        private cachedItemStore: CachedItemStore,
        private dbService: DbService,
        private frameworkService: FrameworkService,
        private sharedPreferences: SharedPreferences,
    ) {
    }

    addManagedProfile(request: AddManagedProfileRequest): Observable<Profile> {
        return defer(async () => {
            if (!(await this.isLoggedInUser())) {
                throw new NoActiveSessionError('No active LoggedIn Session found');
            }

            const {uid} = await this.createManagedProfile(request);

            await this.updateTnCForManagedProfile(uid);

            this.managedProfileAdded$.next(undefined);

            return await this.profileService.createProfile({
                uid: uid,
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                handle: request.firstName,
                board: (request.framework && request.framework['board']) || [],
                medium: (request.framework && request.framework['medium']) || [],
                grade: (request.framework && request.framework['gradeLevel']) || [],
                serverProfile: {} as any
            }, ProfileSource.SERVER).toPromise();
        });
    }

    getManagedServerProfiles(request: GetManagedServerProfilesRequest): Observable<ServerProfile[]> {
        return this.managedProfileAdded$.pipe(
            startWith(undefined),
            mergeMap(() => {
                return defer(async () => {
                    if (!(await this.isLoggedInUser())) {
                        throw new NoActiveSessionError('No active LoggedIn Session found');
                    }

                    const profile = await this.profileService.getActiveSessionProfile({requiredFields: []})
                        .toPromise();

                    const managedByUid: string = (profile.serverProfile && profile.serverProfile['managedBy']) ?
                        profile.serverProfile['managedBy'] :
                        profile.uid;

                    const managedByProfile: ServerProfile = (profile.serverProfile && !profile.serverProfile['managedBy']) ?
                        profile.serverProfile :
                        (
                            await this.profileService.getServerProfilesDetails(
                                {
                                    userId: profile.serverProfile!['managedBy'],
                                    requiredFields: request.requiredFields
                                }
                            ).toPromise()
                        );

                    const fetchFromServer = () => {
                        return defer(async () => {
                            const searchManagedProfilesRequest = new Request.Builder()
                                .withType(HttpRequestType.POST)
                                .withPath(this.profileServiceConfig.profileApiPath + '/search')
                                .withParameters({'fields': request.requiredFields.join(',')})
                                .withBearerToken(true)
                                .withUserToken(true)
                                .withBody({
                                    request: {
                                        filters: {
                                            managedBy: managedByUid
                                        },
                                        sort_by: {createdDate: 'desc'}
                                    }
                                })
                                .build();
                            return await this.apiService
                                .fetch<{ result: { response: { content: ServerProfile[] } } }>(searchManagedProfilesRequest)
                                .toPromise()
                                .then((response) => {
                                    return [managedByProfile, ...response.body.result.response.content];
                                });
                        });
                    };

                    return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
                        managedByUid,
                        ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                        'ttl_' + ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                        () => fetchFromServer(),
                    ).toPromise();
                });
            })
        );
    }

    switchSessionToManagedProfile(request: { uid: string }): Observable<undefined> {
        return defer(() => this.setActiveSessionForManagedProfile(request.uid)).pipe(
            catchError((e) => {
                if (e instanceof NoProfileFoundError) {
                    this.profileService.getServerProfilesDetails({
                        userId: request.uid, requiredFields: []
                    }).pipe(
                        mergeMap((serverProfile: ServerProfile) => {
                            this.profileService.createProfile({
                                uid: request.uid,
                                profileType: ProfileType.STUDENT,
                                source: ProfileSource.SERVER,
                                handle: serverProfile.firstName,
                                board: (serverProfile['framework'] && serverProfile['framework']['board']) || [],
                                medium: (serverProfile['framework'] && serverProfile['framework']['medium']) || [],
                                grade: (serverProfile['framework'] && serverProfile['framework']['gradeLevel']) || [],
                                serverProfile: {} as any
                            }, ProfileSource.SERVER);

                            return this.setActiveSessionForManagedProfile(request.uid);
                        })
                    );
                }

                return throwError(e);
            }),
            mergeMap(() => {
                return this.authService.getSession().pipe(
                    mergeMap((session) => {
                        return this.authService.setSession(new class implements SessionProvider {
                            async provide(): Promise<OAuthSession> {
                                return {
                                    ...session!,
                                    userToken: request.uid
                                };
                            }
                        });
                    })
                );
            }),
            mapTo(undefined)
        );
    }

    private async setActiveSessionForManagedProfile(uid: string) {
        const profileSession = await this.profileService.getActiveProfileSession().toPromise();

        if (profileSession.managedSession) {
            await TelemetryLogger.log.end({
                type: 'session',
                env: 'sdk',
                mode: 'switch-user',
                duration: Math.floor((Date.now() - profileSession.managedSession.createdTime) / 1000),
                correlationData: [
                    {
                        type: 'initiator-id',
                        id: profileSession.managedSession ? profileSession.managedSession.uid : profileSession.uid
                    },
                    {
                        type: 'managed-user-id',
                        id: profileSession.managedSession.uid
                    },
                ]
            }).toPromise();
        }

        const findProfile: () => Promise<Profile | undefined> = async () => {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [uid]
            }).toPromise().then((rows) =>
                rows && rows[0] && ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0])
            );
        };

        const profile = await findProfile();

        if (!profile) {
            throw new NoProfileFoundError(`No Profile found with uid=${uid}`);
        } else if (profile.source !== ProfileSource.SERVER) {
            throw new NoProfileFoundError(`No Server Profile found with uid=${uid}`);
        }

        const setActiveChannelId = async () => {
            const serverProfile: ServerProfile = await this.profileService.getServerProfilesDetails({
                userId: uid,
                requiredFields: []
            }).toPromise();

            return this.frameworkService
                .setActiveChannelId(serverProfile.rootOrg.hashTagId);
        };

        await setActiveChannelId();

        profileSession.managedSession = new ProfileSession(uid);
        await this.sharedPreferences.putString(
            ProfileKeys.KEY_USER_SESSION, JSON.stringify(profileSession)
        ).toPromise();

        TelemetryLogger.log.start({
            type: 'session',
            env: 'sdk',
            mode: 'switch-user',
            correlationData: [
                {
                    type: 'initiator-id',
                    id: profileSession.managedSession ? profileSession.managedSession.uid : profileSession.uid
                },
                {
                    type: 'managed-user-id',
                    id: profileSession.managedSession.uid
                },
            ]
        }).toPromise();
    }

    private async createManagedProfile(addManagedProfileRequest: AddManagedProfileRequest): Promise<{ uid: string }> {
        const currentProfile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();

        if (currentProfile.source !== ProfileSource.SERVER) {
            throw new NoActiveSessionError('No active session available');
        }

        const createManagedProfileRequest = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.profileApiPath_V4 + '/create')
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({
                request: addManagedProfileRequest
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
