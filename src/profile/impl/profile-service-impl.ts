import {
    AcceptTermsConditionRequest,
    GetAllProfileRequest,
    NoActiveSessionError,
    NoProfileFoundError,
    Profile,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    ServerProfileDetailsRequest,
    ServerProfileSearchCriteria,
    UpdateServerProfileInfoRequest
} from '..';
import {DbService} from '../../db';
import {Observable} from 'rxjs';
import {GroupProfileEntry, ProfileEntry} from '../db/schema';
import {ServerProfile} from '../def/server-profile';
import {UniqueId} from '../../db/util/unique-id';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiService} from '../../api';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {SearchServerProfileHandler} from '../handler/search-server-profile-handler';
import {GetServerProfileDetailsHandler} from '../handler/get-server-profile-details-handler';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ProfileMapper} from '../util/profile-mapper';
import {ContentAccessFilterCriteria} from '../def/content-access-filter-criteria';
import {ContentAccess} from '../def/content-access';
import {AcceptTermConditionHandler} from '../handler/accept-term-condition-handler';
import {ProfileHandler} from '../handler/profile-handler';
import {ContentAccessEntry} from '../../content/db/schema';


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

        return this.dbService.insert({
            table: ProfileEntry.TABLE_NAME,
            modelJson: ProfileMapper.mapProfileToProfileDBEntry(profile)
        }).mergeMap(() => Observable.of(profile));
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

    getTenantInfo(): Observable<TenantInfo> {
        return new TenantInfoHandler(this.apiService,
            this.profileServiceConfig).handle();
    }

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]> {
        if (!profileRequest) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                columns: []
            }).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }

        if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            }).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }

        if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
            return this.dbService.execute(`
                SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME}
                ON ${ProfileEntry.TABLE_NAME}.${ProfileEntry.COLUMN_NAME_UID} =
                ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_UID}
                WHERE ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}" AND
                ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
            `).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }


        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}"
        `).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
    }

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return new GetServerProfileDetailsHandler(this.apiService, this.profileServiceConfig, this.cachedItemStore)
            .handle(serverProfileDetailsRequest);
    }

    getActiveSessionProfile(): Observable<Profile> {
        return this.getActiveProfileSession()
            .map((profileSession: ProfileSession | undefined) => {
                if (!profileSession) {
                    throw new NoActiveSessionError('No active session available');
                }

                return profileSession;
            })
            .mergeMap((profileSession: ProfileSession) => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileSession.uid]
                }).map((rows) => rows && rows[0]);
            });
    }

    setActiveSessionForProfile(profileUid: string): Observable<boolean> {
        return this.dbService
            .read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [profileUid]
            })
            .map((rows: ProfileEntry.SchemaMap[]) =>
                rows && rows[0] && ProfileMapper.mapProfileDBEntryToProfile(rows[0])
            )
            .map((profile: Profile | undefined) => {
                if (!profile) {
                    throw new NoProfileFoundError('No Profile found');
                }

                return profile;
            })
            .mergeMap((profile: Profile) => {
                const profileSession = new ProfileSession(profile.uid);
                return this.keyValueStore.setValue(ProfileServiceImpl.KEY_USER_SESSION, JSON.stringify({
                    uid: profileSession.uid,
                    sid: profileSession.sid,
                    createdTime: profileSession.createdTime
                }));
            });
    }

    getActiveProfileSession(): Observable<ProfileSession | undefined> {
        return this.keyValueStore.getValue(ProfileServiceImpl.KEY_USER_SESSION)
            .map((response) => {
                if (!response) {
                    return undefined;
                }

                return JSON.parse(response);

            });
    }

    acceptTermsAndConditions(acceptTermsConditions: AcceptTermsConditionRequest): Observable<boolean> {
        return new AcceptTermConditionHandler(this.apiService, this.profileServiceConfig).handle(acceptTermsConditions);
    }

    getAllContentAccess(criteria: ContentAccessFilterCriteria): Observable<ContentAccess[]> {
        let userFilter = '';
        let contentFilter = '';
        if (criteria) {
            if (criteria.uid) {
                userFilter = `${ContentAccessEntry.COLUMN_NAME_UID} = '${criteria.uid}'`;
            }
            if (criteria.contentId) {
                contentFilter = `${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER} = '${criteria.contentId}'`;
            }
        }
        let filter = '';
        if (userFilter && contentFilter) {
            filter = filter.concat(` where ${userFilter} AND ${contentFilter}`);
        } else if (contentFilter) {
            filter = filter.concat(` where ${contentFilter}`);
        } else if (userFilter) {
            filter = filter.concat(` where ${userFilter}`);
        }
        const query = `SELECT * FROM ${ContentAccessEntry.TABLE_NAME} ${filter}`;
        return this.dbService.execute(filter).map((contentAccessList: ContentAccessEntry.SchemaMap[]) => {
            return contentAccessList.map((contentAccess: ContentAccessEntry.SchemaMap) =>
                ProfileHandler.mapDBEntryToContenetAccess(contentAccess));
        });

    }

    private mapDbProfileEntriesToProfiles(profiles: ProfileEntry.SchemaMap[]): Profile[] {
        return profiles.map((profile: ProfileEntry.SchemaMap) => ProfileMapper.mapProfileDBEntryToProfile(profile));
    }
}
