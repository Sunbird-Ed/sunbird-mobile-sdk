import {Profile} from './profile';
import {Observable} from 'rxjs';
import {TenantInfo} from './tenant-info';
import {ServerProfileSearchCriteria} from './server-profile-search-criteria';
import {ServerProfile} from './server-profile';
import {UpdateServerProfileInfoRequest} from './update-server-profile-info-request';
import {GetAllProfileRequest} from './get-all-profile-request';
import {ServerProfileDetailsRequest} from './server-profile-details-request';
import {ProfileSession} from './profile-session';
import {ContentAccessFilterCriteria} from './content-access-filter-criteria';
import {ContentAccess} from './content-access';
import {AcceptTermsConditionRequest} from './accept-terms-condition-request';


export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<undefined>;

    updateServerProfile(updateServerProfileRequest: UpdateServerProfileInfoRequest): Observable<Profile>;

    getTenantInfo(): Observable<TenantInfo>;

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]>;

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]>;

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile>;

    getCurrentProfile(): Observable<Profile>;

    setCurrentProfile(uid: string): Observable<boolean>;

    getCurrentProfileSession(): Observable<ProfileSession | undefined>;

    getAllContentAccess(criteria: ContentAccessFilterCriteria): Observable<ContentAccess[]>;

    acceptTermsAndConditions(acceptTermsConditions: AcceptTermsConditionRequest): Observable<boolean>;
}
