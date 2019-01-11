import {Profile} from './profile';
import {Observable} from 'rxjs';
import {TenantInfoRequest} from './tenant-info-request';
import {TenantInfo} from './tenant-info';
import {ServerProfileSearchCriteria} from './server-profile-search-criteria';
import {ServerProfile} from './server-profile';
import {UpdateServerProfileInfoRequest} from './update-server-profile-info-request';
import {Group} from './group';
import {GetAllGroupRequest} from './get-all-group-request';
import {ProfilesToGroupRequest} from './profiles-to-group-request';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;

    updateServerProfile(updateServerProfileRequest: UpdateServerProfileInfoRequest): Observable<Profile>;

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo>;

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]>;

    createGroup(group: Group): Observable<Group>;

    deleteGroup(gid: string): Observable<number>;

    updateGroup(group: Group): Observable<Group>;

    getAllGroup(getAllGroupRequest: GetAllGroupRequest): Observable<Group[]>;

    addProfilesToGroup(updateProfileRequest: ProfilesToGroupRequest): Observable<number>;
}
