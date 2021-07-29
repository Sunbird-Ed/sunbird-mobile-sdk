import { Group } from './group';
import { Observable } from 'rxjs';
import { GetAllGroupRequest } from './get-all-group-request';
import { ProfilesToGroupRequest } from './profiles-to-group-request';
import { GroupSession } from './group-session';
export interface GroupService {
    createGroup(group: Group): Observable<Group>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: Group): Observable<Group>;
    getActiveSessionGroup(): Observable<Group>;
    setActiveSessionForGroup(groupGid: string): Observable<boolean>;
    getActiveGroupSession(): Observable<GroupSession | undefined>;
    getAllGroups(getAllGroupRequest?: GetAllGroupRequest): Observable<Group[]>;
    addProfilesToGroup(profilesToGroupRequest: ProfilesToGroupRequest): Observable<number>;
    removeActiveGroupSession(): Observable<undefined>;
}
