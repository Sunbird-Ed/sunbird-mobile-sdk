import {Profile} from './profile';
import {Observable} from 'rxjs';
import {UsersSearchCriteria} from './users-search-criteria';
import {User} from './user';
import {TenantInfoRequest} from './tenant-info-request';
import {TenantInfo} from './tenant-info';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;

    updateUserInfo(profile: Profile): Observable<Profile>;

    getUsers(searchCriteria: UsersSearchCriteria): Observable<User[]>;

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo[]>;
}

