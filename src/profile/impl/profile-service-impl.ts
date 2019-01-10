import {Profile, ProfileService} from '..';
import {DbService, NoSqlFormatter, ObjectMapper} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry, ProfileEntry} from '../db/schema';
import {GroupsConstant, ProfileConstant} from '../def/constant';
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
import {GroupRequest} from '../def/group-request';

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
        return this.dbService.delete(ProfileEntry.TABLE_NAME, 'uid =? ', [uid]);
    }

    updateServerProfile(updateUserInfoRequest: UpdateServerProfileInfoRequest): Observable<Profile> {
        // TODO
        return new UpdateServerProfileInfoHandler(this.keyValueStore, this.apiService,
            this.profileServiceConfig, this.sessionAuthenticator).handle(updateUserInfoRequest);
    }

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        // TODO
        return Observable.from([]);
    }

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        // TODO
        return new TenantInfoHandler(this.keyValueStore, this.apiService,
            this.profileServiceConfig, this.sessionAuthenticator).handle(tenantInfoRequest);
    }

    createGroup(group: Group): Observable<Group> {
        const saveGroupToDb = NoSqlFormatter.toDb(group);
        if (group !== undefined) {
            this.dbService.insert({
                table: GroupEntry.TABLE_NAME,
                modelJson: ObjectMapper.map(saveGroupToDb, {
                    [GroupsConstant.GID]: UniqueId.generateUniqueId(),
                    [GroupsConstant.NAME]: saveGroupToDb.groupName,
                    [GroupsConstant.CREATED_AT]: Date.now(),
                    [GroupsConstant.GRADE]: saveGroupToDb.grade,
                    [GroupsConstant.GRADE_VALUE]: saveGroupToDb.gradeValue,
                    [GroupsConstant.SYLLABUS]: saveGroupToDb.syllabus,
                    [GroupsConstant.UPDATED_AT]: Date.now()
                })
            });
        }
        return Observable.of(group);
    }

    deleteGroup(gid: string): Observable<number> {
        this.dbService.beginTransaction();
        const transaction = Observable.merge
        (this.dbService.delete(GroupProfileEntry.TABLE_NAME, 'gid =?', [gid]),
            this.dbService.delete(GroupProfileEntry.TABLE_NAME, 'gid =?', [gid]));
        this.dbService.endTransaction(true);
        return transaction;
    }

    updateGroup(group: Group): Observable<Group> {
        const updateToDb = NoSqlFormatter.toDb(group);
        if (group! === undefined) {
            this.dbService.update({
                table: GroupEntry.TABLE_NAME,
                selection: 'gid =?',
                modelJson: ObjectMapper.map(updateToDb, {
                    [GroupsConstant.NAME]: updateToDb.name,
                    [GroupsConstant.SYLLABUS]: updateToDb.syllabus,
                    [GroupsConstant.UPDATED_AT]: Date.now(),
                    [GroupsConstant.GRADE]: updateToDb.grade,
                    [GroupsConstant.GRADE_VALUE]: updateToDb.gradeValue
                })
            });
        }
        return Observable.of(group);
    }

    getAllGroup(groupRequest: GroupRequest): Observable<Group[]> {
        const groupList = this.dbService.read({
            table: GroupEntry.TABLE_NAME,
            columns: ['gid']
        });
        if (groupList === undefined) {
            this.getAllGroup(groupRequest);
        }
        return Observable.from(groupList);
    }
}
