import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { GetAllGroupRequest, Group, GroupService, ProfilesToGroupRequest } from '..';
export declare class GroupServiceImpl implements GroupService {
    private dbService;
    constructor(dbService: DbService);
    createGroup(group: Group): Observable<Group>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: Group): Observable<Group>;
    getAllGroups(groupRequest?: GetAllGroupRequest): Observable<Group[]>;
    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number>;
}
