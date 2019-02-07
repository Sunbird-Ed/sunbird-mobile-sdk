import {
    GetAllProfileRequest,
    Profile,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    UpdateServerProfileInfoRequest
} from '..';
import {DbService} from '../../db';
import {Observable} from 'rxjs';
import {GroupProfileEntry, ProfileEntry} from '../db/schema';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {UniqueId} from '../../db/util/unique-id';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiService} from '../../api';
import {SessionAuthenticator} from '../../auth';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {SearchServerProfileHandler} from '../handler/search-server-profile-handler';
import {ServerProfileDetailsRequest} from '../def/server-profile-details-request';
import {GetServerProfileDetailsHandler} from '../handler/get-server-profile-details-handler';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ProfileMapper} from '../util/profile-mapper';


export class ProfileServiceImpl implements ProfileService {
    private static readonly KEY_USER_SESSION = 'session';

    constructor(private profileServiceConfig: ProfileServiceConfig,
                private dbService: DbService,
                private apiService: ApiService,
                private cachedItemStore: CachedItemStore<ServerProfile>,
                private keyValueStore: KeyValueStore) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        profile.uid = UniqueId.generateUniqueId();
        profile.createdAt = Date.now();
        this.dbService.insert({
            table: ProfileEntry.TABLE_NAME,
            modelJson: ProfileMapper.mapProfileToProfileDBEntry(profile)
        });

        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<undefined> {
        return this.dbService.delete({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [uid]
        });
    }

    updateServerProfile(updateUserInfoRequest: UpdateServerProfileInfoRequest): Observable<Profile> {
        return new UpdateServerProfileInfoHandler(this.apiService,
            this.profileServiceConfig).handle(updateUserInfoRequest);
    }

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        return new SearchServerProfileHandler(this.apiService, this.profileServiceConfig).handle(searchCriteria);
    }

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        return new TenantInfoHandler(this.apiService,
            this.profileServiceConfig).handle(tenantInfoRequest);
    }

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]> {
        if (!profileRequest) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                columns: []
            }).map((profiles: ProfileEntry.SchemaMap[]) =>
                profiles.map((profile: ProfileEntry.SchemaMap) => ProfileMapper.mapProfileDBEntryToProfile(profile))
            );
        }

        if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            }).map((profiles: ProfileEntry.SchemaMap[]) =>
                profiles.map((profile: ProfileEntry.SchemaMap) => ProfileMapper.mapProfileDBEntryToProfile(profile))
            );
        }


        if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
            return this.dbService.execute(`
                SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
                ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}" AND
                ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
            `).map((profiles: ProfileEntry.SchemaMap[]) =>
                profiles.map((profile: ProfileEntry.SchemaMap) => ProfileMapper.mapProfileDBEntryToProfile(profile))
            );
        }

        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}"
        `).map((profiles: ProfileEntry.SchemaMap[]) =>
            profiles.map((profile: ProfileEntry.SchemaMap) => ProfileMapper.mapProfileDBEntryToProfile(profile))
        );
    }

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return new GetServerProfileDetailsHandler(this.apiService, this.profileServiceConfig, this.cachedItemStore)
            .handle(serverProfileDetailsRequest);
    }

    getCurrentProfile(): Observable<Profile> {
        return this.getCurrentProfileSession()
            .mergeMap((profileSession: ProfileSession) => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileSession.uid]
                }).map((rows) => rows && rows[0]);
            });
    }

    setCurrentProfile(uid: string): Observable<boolean> {
        return this.dbService
            .read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [uid]
            }).map((rows) => rows && rows[0])
            .mergeMap((profile: Profile) => {
                const profileSession = new ProfileSession(profile.uid);
                return this.keyValueStore.setValue(ProfileServiceImpl.KEY_USER_SESSION, JSON.stringify(profileSession));
            });
    }

    getCurrentProfileSession(): Observable<ProfileSession> {
        return this.keyValueStore.getValue(ProfileServiceImpl.KEY_USER_SESSION)
            .map((value) => value ? JSON.parse(value) : (error: any) => console.log('No session available', error));
    }
}
