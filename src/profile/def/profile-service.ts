import {Profile} from './profile';
import {Observable} from 'rxjs';
import {TenantInfoRequest} from './tenant-info-request';
import {TenantInfo} from './tenant-info';
import {ServerProfileSearchCriteria} from './server-profile-search-criteria';
import {ServerProfile} from './server-profile';
import {UpadateServerProfileInfoRequest} from './upadate-server-profile-info-request';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;

    updateServerProfile(updateServerProfileRequest: UpadateServerProfileInfoRequest): Observable<Profile>;

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo>;

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]>;
}
