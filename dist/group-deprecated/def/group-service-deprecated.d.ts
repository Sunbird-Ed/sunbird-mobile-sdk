import { GroupDeprecated } from './groupDeprecated';
import { Observable } from 'rxjs';
import { GetAllGroupRequestDeprecated } from './get-all-group-request-deprecated';
import { ProfilesToGroupRequestDeprecated } from './profiles-to-group-request-deprecated';
import { GroupSessionDeprecated } from './group-session-deprecated';
export interface GroupServiceDeprecated {
    createGroup(group: GroupDeprecated): Observable<GroupDeprecated>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: GroupDeprecated): Observable<GroupDeprecated>;
    getActiveSessionGroup(): Observable<GroupDeprecated>;
    setActiveSessionForGroup(groupGid: string): Observable<boolean>;
    getActiveGroupSession(): Observable<GroupSessionDeprecated | undefined>;
    getAllGroups(getAllGroupRequest?: GetAllGroupRequestDeprecated): Observable<GroupDeprecated[]>;
    addProfilesToGroup(profilesToGroupRequest: ProfilesToGroupRequestDeprecated): Observable<number>;
    removeActiveGroupSession(): Observable<undefined>;
}
