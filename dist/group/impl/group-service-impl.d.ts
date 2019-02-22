import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { GetAllGroupRequest, Group, GroupService, GroupSession, ProfilesToGroupRequest } from '..';
import { KeyValueStore } from '../../key-value-store';
export declare class GroupServiceImpl implements GroupService {
    private dbService;
    private keyValueStore;
    private static readonly KEY_GROUP_SESSION;
    constructor(dbService: DbService, keyValueStore: KeyValueStore);
    createGroup(group: Group): Observable<Group>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: Group): Observable<Group>;
    getActiveSessionGroup(): Observable<Group>;
    setActiveSessionForGroup(gid: string): Observable<boolean>;
    getActiveGroupSession(): Observable<GroupSession | undefined>;
    getAllGroups(groupRequest?: GetAllGroupRequest): Observable<Group[]>;
    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number>;
}
