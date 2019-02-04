import {Profile, ProfileService, ProfileSource} from '..';
import {DbService, NoSqlFormatter} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry, ProfileEntry} from '../db/schema';
import {GroupProfileConstant, GroupsConstant} from '../def/constant';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {UniqueId} from '../../db/util/unique-id';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiService} from '../../api';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {UpdateServerProfileInfoRequest} from '../def/update-server-profile-info-request';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {Group} from '../def/group';
import {ProfilesToGroupRequest} from '../def/profiles-to-group-request';
import {ProfileRequest} from '../def/profile-request';
import {GetAllGroupRequest} from '../def/get-all-group-request';
import {SearchServerProfileHandler} from '../handler/search-server-profile-handler';
import {ServerProfileDetailsRequest} from '../def/server-profile-details-request';
import {GetServerProfileDetailsHandler} from '../handler/get-server-profile-details-handler';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ProfileSession} from '../def/profile-session';
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

        this.dbService.insert({
            table: ProfileEntry.TABLE_NAME,
            modelJson: ProfileMapper.mapProfileToProfileDBEntry(profile)
        });

        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<number> {
        return this.dbService.delete({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [`"${uid}"`]
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

    getAllProfiles(profileRequest?: ProfileRequest): Observable<Profile[]> {
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
            ${GroupProfileConstant.GID} = "${profileRequest.groupId}" AND
            ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
        `);
        }

        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileConstant.GID} = "${profileRequest.groupId}"
        `);
    }

    createGroup(group: Group): Observable<Group> {
        const saveGroupToDb = NoSqlFormatter.toDb(group);
        if (group !== undefined) {
            this.dbService.insert({
                table: GroupEntry.TABLE_NAME,
                modelJson: {
                    [GroupsConstant.GID]: UniqueId.generateUniqueId(),
                    [GroupsConstant.NAME]: saveGroupToDb.groupName,
                    [GroupsConstant.CREATED_AT]: Date.now(),
                    [GroupsConstant.GRADE]: saveGroupToDb.grade,
                    [GroupsConstant.GRADE_VALUE]: saveGroupToDb.gradeValue,
                    [GroupsConstant.SYLLABUS]: saveGroupToDb.syllabus,
                    [GroupsConstant.UPDATED_AT]: Date.now()
                }
            });
        }
        return Observable.of(group);
    }

    deleteGroup(gid: string): Observable<number> {
        this.dbService.beginTransaction();
        return Observable.zip(this.dbService.delete({
                table: GroupEntry.TABLE_NAME,
                selection: `${GroupsConstant.GID} = ?`,
                selectionArgs: [`"${gid}"`]
            }),
            this.dbService.delete({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileConstant.GID} = ?`,
                selectionArgs: [`"${gid}"`]
            })
        ).map(() => {
            this.dbService.endTransaction(true);
            return 1;
        });
    }

    updateGroup(group: Group): Observable<Group> {
        const updateToDb: Group = NoSqlFormatter.toDb(group);
        this.dbService.update({
            table: GroupEntry.TABLE_NAME,
            selection: 'gid = ?',
            modelJson: {
                [GroupsConstant.NAME]: updateToDb.name,
                [GroupsConstant.SYLLABUS]: updateToDb.syllabus,
                [GroupsConstant.UPDATED_AT]: Date.now(),
                [GroupsConstant.GRADE]: updateToDb.grade,
                [GroupsConstant.GRADE_VALUE]: updateToDb.gradeValueMap
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
            ${GroupsConstant.GID} = ${GroupProfileConstant.GID} WHERE
            ${GroupProfileConstant.UID} = "${groupRequest.uid}
        `);
        }
    }


    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number> {
        return this.dbService.delete({
            table: GroupProfileEntry.TABLE_NAME,
            selection: `${GroupProfileConstant.GID} = ?`,
            selectionArgs: [`"${profileToGroupRequest.groupId}"`]
        }).do(() => {
            this.dbService.beginTransaction();
        }).switchMap(() => {
            return Observable.from(profileToGroupRequest.uidList)
                .mergeMap((uid: string) => {
                    return this.dbService.insert({
                        table: GroupProfileEntry.TABLE_NAME,
                        modelJson: {
                            [GroupProfileConstant.GID]: profileToGroupRequest.groupId,
                            [GroupProfileConstant.UID]: uid
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
