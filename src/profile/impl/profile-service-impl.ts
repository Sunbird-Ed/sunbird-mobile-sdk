import {Profile, ProfileService} from '..';
import {DbService, NoSqlFormatter, ObjectMapper} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry, ProfileEntry} from '../db/schema';
import {GroupProfileConstant, GroupsConstant, ProfileConstant} from '../def/constant';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {UniqueId} from '../../db/util/unique-id';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiService} from '../../api';
import {KeyValueStore} from '../../key-value-store';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {UpdateServerProfileInfoRequest} from '../def/update-server-profile-info-request';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {Group} from '../def/group';
import {GetAllGroupRequest} from '../def/get-all-group-request';
import {ProfilesToGroupRequest} from '../def/profiles-to-group-request';

export class ProfileServiceImpl implements ProfileService {
    constructor(private dbService: DbService,
                private apiService: ApiService,
                private keyValueStore: KeyValueStore,
                private profileServiceConfig: ProfileServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        const saveToDb = NoSqlFormatter.toDb(profile);
        this.dbService.insert({
            table: ProfileEntry.TABLE_NAME,
            modelJson: ObjectMapper.map(saveToDb, {
                [ProfileConstant.BOARD]: saveToDb.board,
                [ProfileConstant.GRADE]: saveToDb.Grade,
                [ProfileConstant.HANDLE]: saveToDb.handle,
                [ProfileConstant.SYLLABUS]: saveToDb.syllabus,
                [ProfileConstant.SOURCE]: saveToDb.source,
                [ProfileConstant.MEDIUM]: saveToDb.medium,
                [ProfileConstant.PROFILE_TYPE]: saveToDb.profileType,
                [ProfileConstant.GRADE_VALUE]: saveToDb.gradeValue,
                [ProfileConstant.SUBJECT]: saveToDb.subject,
                [ProfileConstant.UID]: UniqueId.generateUniqueId(),
                [ProfileConstant.CREATED_AT]: Date.now()
            })
        });
        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<number> {
        return this.dbService.delete({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileConstant.UID} = ?`,
            selectionArgs: [`"${uid}"`]
        });
    }

    updateServerProfile(updateUserInfoRequest: UpdateServerProfileInfoRequest): Observable<Profile> {
        return new UpdateServerProfileInfoHandler(this.keyValueStore, this.apiService,
            this.profileServiceConfig, this.sessionAuthenticator).handle(updateUserInfoRequest);
    }

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        // TODO
        return Observable.from([]);
    }

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        return new TenantInfoHandler(this.keyValueStore, this.apiService,
            this.profileServiceConfig, this.sessionAuthenticator).handle(tenantInfoRequest);
    }
    }
    getAllProfile(profileRequest?: ProfileRequest): Observable<Profile[]> {
       if (!profileRequest) {
           return this.dbService.read({
               table: ProfileEntry.TABLE_NAME,
               columns: []
           });
       }

       if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileConstant.SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            });
       }


       if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupProfileConstant.GID} = "${profileRequest.groupId}" AND
            ${ProfileConstant.SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
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
        const updateToDb = NoSqlFormatter.toDb(group);
        if (group! === undefined) {
            this.dbService.update({
                table: GroupEntry.TABLE_NAME,
                selection: 'gid =?',
                modelJson: {
                    [GroupsConstant.NAME]: updateToDb.name,
                    [GroupsConstant.SYLLABUS]: updateToDb.syllabus,
                    [GroupsConstant.UPDATED_AT]: Date.now(),
                    [GroupsConstant.GRADE]: updateToDb.grade,
                    [GroupsConstant.GRADE_VALUE]: updateToDb.gradeValue
                }
            });
        }
        return Observable.of(group);
    }

    getAllGroup(groupRequest: GetAllGroupRequest): Observable<Group[]> {
        return this.dbService.read({
            table: GroupEntry.TABLE_NAME,
            columns: []
        });
    }

    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number> {
        return this.dbService.delete({
            table: GroupProfileEntry.TABLE_NAME,
            selection: `${GroupProfileConstant.GID} = (?)`,
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
}
