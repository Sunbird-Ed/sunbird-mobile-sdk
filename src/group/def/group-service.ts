import {Group} from './group';
import {Observable} from 'rxjs';
import {GetAllGroupRequest} from './get-all-group-request';
import {ProfilesToGroupRequest} from './profiles-to-group-request';


export interface GroupService {

    createGroup(group: Group): Observable<Group>;

    deleteGroup(gid: string): Observable<undefined>;

    updateGroup(group: Group): Observable<Group>;

    getAllGroups(getAllGroupRequest?: GetAllGroupRequest): Observable<Group[]>;

    addProfilesToGroup(profilesToGroupRequest: ProfilesToGroupRequest): Observable<number>;

}
