import {AddManagedProfileRequest} from '../def/add-managed-profile-request';
import {defer, Observable} from 'rxjs';
import {Profile, ProfileService, ProfileServiceConfig, ProfileSource, ProfileType} from '..';
import {KeyValueStore} from '../../key-value-store';
import {ProfileEntry} from '../db/schema';
import {ArrayUtil} from '../../util/array-util';
import {ProfileDbEntryMapper} from '../util/profile-db-entry-mapper';
import {DbService} from '../../db';
import {CsRequest} from '@project-sunbird/client-services/core/http-service';
import {ApiService, HttpRequestType} from '../../api';
import {UniqueId} from '../../db/util/unique-id';

export class ManagedProfileManager {
    private static readonly MANAGED_PROFILE_IDS_KEY_PREFIX = 'managed_profile';

    constructor(
        private profileService: ProfileService,
        private profileServiceConfig: ProfileServiceConfig,
        private keyValueStore: KeyValueStore,
        private dbService: DbService,
        private apiService: ApiService
    ) {
    }

    addManagedProfile(request: AddManagedProfileRequest): Observable<Profile> {
        return defer(async () => {
            const profile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();

            const apiRequest = new CsRequest.Builder()
                .withType(HttpRequestType.POST)
                .withPath(this.profileServiceConfig.profileApiPath + '/create')
                .withBearerToken(true)
                .withUserToken(true)
                .withBody({
                    request: {
                        userName: UniqueId.generateUniqueId(), // todo userName should not be required
                        firstName: request.name,
                        managedBy: profile.uid
                    }
                })
                .build();

            try {
                const res = await this.apiService.fetch<{ result: { userId: string } }>(apiRequest).toPromise();

                const createdProfile = await this.profileService.createProfile({
                    uid: res.body.result.userId,
                    profileType: ProfileType.STUDENT,
                    source: ProfileSource.SERVER,
                    handle: request.name,
                    board: request.board,
                    medium: request.medium,
                    grade: request.grade,
                }, ProfileSource.SERVER).toPromise();

                const response = await this.keyValueStore
                    .getValue(ManagedProfileManager.MANAGED_PROFILE_IDS_KEY_PREFIX + profile.uid)
                    .toPromise();

                let uids: string[] = [];

                if (response) {
                    try {
                        uids = JSON.parse(response);
                        uids.push(createdProfile.uid);
                    } catch (e) {
                        console.error(e);
                    }
                }

                await this.keyValueStore
                    .setValue(ManagedProfileManager.MANAGED_PROFILE_IDS_KEY_PREFIX + profile.uid, JSON.stringify(uids))
                    .toPromise();

                return createdProfile;
            } catch (e) {
                console.error(e);
                throw e;
            }
        });
    }

    getManagedProfiles(): Observable<Profile[]> {
        return defer(async () => {
            const profile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();
            const response = await this.keyValueStore
                .getValue(ManagedProfileManager.MANAGED_PROFILE_IDS_KEY_PREFIX + profile.uid)
                .toPromise();

            let uids: string[] = [];
            try {
                if (response) {
                    uids = JSON.parse(response);
                }
            } catch (e) {
                console.error(e);
            }

            const query = `SELECT * FROM ${ProfileEntry.TABLE_NAME} WHERE ${ProfileEntry.COLUMN_NAME_UID} IN (${ArrayUtil.joinPreservingQuotes(uids)})`;
            return this.dbService.execute(query).toPromise().then((rows) => {
                return rows.map((row) => ProfileDbEntryMapper.mapProfileDBEntryToProfile(row));
            });
        });
    }
}
