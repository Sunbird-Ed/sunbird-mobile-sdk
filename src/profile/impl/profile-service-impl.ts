import {
    Profile,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    UpdateServerProfileInfoRequest
} from '..';
import {DbService, NoSqlFormatter} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry, ProfileEntry} from '../db/schema';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {UniqueId} from '../../db/util/unique-id';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiService} from '../../api';
import {SessionAuthenticator} from '../../auth';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {Group} from '../def/group';
import {ProfilesToGroupRequest} from '../def/profiles-to-group-request';
import {GetAllProfileRequest} from '..';
import {GetAllGroupRequest} from '../def/get-all-group-request';
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
                private keyValueStore: KeyValueStore,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        profile.uid = UniqueId.generateUniqueId();
        profile.created_at = Date.now();
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
            this.profileServiceConfig, this.sessionAuthenticator).handle(updateUserInfoRequest);
    }

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        return new SearchServerProfileHandler(this.apiService, this.profileServiceConfig,
            this.sessionAuthenticator).handle(searchCriteria);
    }

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        return new TenantInfoHandler(this.apiService,
            this.profileServiceConfig, this.sessionAuthenticator).handle(tenantInfoRequest);
    }

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]> {
        if (!profileRequest) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                columns: []
            });
        }

        if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            });
        }


        if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
            return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}" AND
            ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
        `);
        }

        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}"
        `);
    }

    createGroup(group: Group): Observable<Group> {
        const saveGroupToDb = NoSqlFormatter.toDb(group);
        if (group !== undefined) {
            this.dbService.insert({
                table: GroupEntry.TABLE_NAME,
                modelJson: {
                    [GroupEntry.COLUMN_NAME_GID]: UniqueId.generateUniqueId(),
                    [GroupEntry.COLUMN_NAME_NAME]: saveGroupToDb.groupName,
                    [GroupEntry.COLUMN_NAME_CREATED_AT]: Date.now(),
                    [GroupEntry.COLUMN_NAME_GRADE]: saveGroupToDb.grade,
                    [GroupEntry.COLUMN_NAME_GRADE_VALUE]: saveGroupToDb.gradeValue,
                    [GroupEntry.COLUMN_NAME_SYLLABUS]: saveGroupToDb.syllabus,
                    [GroupEntry.COLUMN_NAME_UPDATED_AT]: Date.now()
                }
            });
        }
        return Observable.of(group);
    }

    deleteGroup(gid: string): Observable<undefined> {
        this.dbService.beginTransaction();

        return Observable.zip(
            this.dbService.delete({
                table: GroupEntry.TABLE_NAME,
                selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [`"${gid}"`]
            }),
            this.dbService.delete({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [`"${gid}"`]
            })
        ).do(() => {
            this.dbService.endTransaction(true);
        }).map(() => {
            return undefined;
        });
    }

    updateGroup(group: Group): Observable<Group> {
        const updateToDb: Group = NoSqlFormatter.toDb(group);
        this.dbService.update({
            table: GroupEntry.TABLE_NAME,
            selection: 'gid = ?',
            modelJson: {
                [GroupEntry.COLUMN_NAME_NAME]: updateToDb.name,
                [GroupEntry.COLUMN_NAME_SYLLABUS]: updateToDb.syllabus,
                [GroupEntry.COLUMN_NAME_UPDATED_AT]: Date.now(),
                [GroupEntry.COLUMN_NAME_GRADE]: updateToDb.grade,
                [GroupEntry.COLUMN_NAME_GRADE_VALUE]: updateToDb.gradeValueMap
            }
        });
        return Observable.of(group);
    }

    getAllGroup(groupRequest: GetAllGroupRequest): Observable<Group[]> {
        if (!groupRequest.uid) {
            return this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                columns: []
            });
        } else {
            return this.dbService.execute(`
            SELECT * FROM ${GroupEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupEntry.COLUMN_NAME_GID} = ${GroupProfileEntry.COLUMN_NAME_GID} WHERE
            ${GroupProfileEntry.COLUMN_NAME_UID} = "${groupRequest.uid}
        `);
        }
    }


    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number> {
        return this.dbService.delete({
            table: GroupProfileEntry.TABLE_NAME,
            selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
            selectionArgs: [`"${profileToGroupRequest.groupId}"`]
        }).do(() => {
            this.dbService.beginTransaction();
        }).switchMap(() => {
            return Observable.from(profileToGroupRequest.uidList)
                .mergeMap((uid: string) => {
                    return this.dbService.insert({
                        table: GroupProfileEntry.TABLE_NAME,
                        modelJson: {
                            [GroupProfileEntry.COLUMN_NAME_GID]: profileToGroupRequest.groupId,
                            [GroupProfileEntry.COLUMN_NAME_UID]: uid
                        }
                    });
                });
        }).do(() => {
            this.dbService.endTransaction(true);
        }).catch((e) => {
            this.dbService.endTransaction(false);
            return Observable.throw(e);
        });
    }

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return new GetServerProfileDetailsHandler(this.apiService, this.profileServiceConfig,
            this.sessionAuthenticator, this.cachedItemStore)
            .handle(serverProfileDetailsRequest);
    }

    getCurrentProfile(): Observable<Profile> {
        return this.getCurrentProfileSession()
            .mergeMap((profileSession: ProfileSession) => {
                return this.dbService.read({
                    table: GroupProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [`"${profileSession.uid}"`]
                }).map((rows) => rows && rows[0]);
            });
    }

    setCurrentProfile(uid: string): Observable<boolean> {
        return this.dbService
            .read({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [`"${uid}"`]
            }).map((rows) => rows && rows[0])
            .mergeMap((profile: Profile) => {
                const profileSession = new ProfileSession(profile.uid);
                return this.keyValueStore.setValue(ProfileServiceImpl.KEY_USER_SESSION, JSON.stringify(profileSession));
            });
    }

    getCurrentProfileSession(): Observable<ProfileSession> {
        return this.keyValueStore.getValue(ProfileServiceImpl.KEY_USER_SESSION)
            .map((value) => JSON.parse(value!));
    }
}
