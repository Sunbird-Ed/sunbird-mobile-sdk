import { DbService } from '../../db';
import { GetAllGroupRequest, Group, GroupService, GroupSession, ProfilesToGroupRequest } from '..';
import { ProfileService } from '../../profile';
import { SharedPreferences } from '../../util/shared-preferences';
import { Container } from 'inversify';
import { Observable } from 'rxjs';
export declare class GroupServiceImpl implements GroupService {
    private container;
    private dbService;
    private profileService;
    private sharedPreferences;
    private static readonly KEY_GROUP_SESSION;
    constructor(container: Container, dbService: DbService, profileService: ProfileService, sharedPreferences: SharedPreferences);
    private readonly telemetryService;
    createGroup(group: Group): Observable<Group>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: Group): Observable<Group>;
    getActiveSessionGroup(): Observable<Group>;
    setActiveSessionForGroup(gid: string): Observable<boolean>;
    getActiveGroupSession(): Observable<GroupSession | undefined>;
    getAllGroups(groupRequest?: GetAllGroupRequest): Observable<Group[]>;
    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number>;
    removeActiveGroupSession(): Observable<undefined>;
}
