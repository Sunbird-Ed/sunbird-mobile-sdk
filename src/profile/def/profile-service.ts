import {Profile, ProfileSource} from './profile';
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
import {IsProfileAlreadyInUseRequest} from './is-profile-already-in-use-request';
import {ProfileExistsResponse} from './profile-exists-response';
import {GenerateOtpRequest} from './generate-otp-request';
import {VerifyOtpRequest} from './verify-otp-request';
import {LocationSearchCriteria} from './location-search-criteria';
import {LocationSearchResult} from './location-search-result';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {ProfileExportRequest} from './profile-export-request';
import {ProfileExportResponse} from './profile-export-response';
import {ProfileImportRequest} from './profile-import-request';
import {ProfileImportResponse} from './profile-import-response';


export interface ProfileService extends SdkServiceOnInitDelegate {
    createProfile(profile: Profile, profileSource: ProfileSource): Observable<Profile>;

    deleteProfile(uid: string): Observable<undefined>;

    updateProfile(profile: Profile): Observable<Profile>;

    updateServerProfile(updateServerProfileRequest: UpdateServerProfileInfoRequest): Observable<Profile>;

    getTenantInfo(): Observable<TenantInfo>;

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]>;

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]>;

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile>;

    getActiveSessionProfile(): Observable<Profile>;

    setActiveSessionForProfile(profileUid: string): Observable<boolean>;

    getActiveProfileSession(): Observable<ProfileSession>;

    getAllContentAccess(criteria: ContentAccessFilterCriteria): Observable<ContentAccess[]>;

    addContentAccess(contentAccess: ContentAccess): Observable<boolean>;

    acceptTermsAndConditions(acceptTermsConditions: AcceptTermsConditionRequest): Observable<boolean>;

    isProfileAlreadyInUse(isProfileAlreadyInUseRequest: IsProfileAlreadyInUseRequest): Observable<ProfileExistsResponse>;

    generateOTP(generateOtpRequest: GenerateOtpRequest): Observable<boolean>;

    verifyOTP(verifyOTPRequest: VerifyOtpRequest): Observable<boolean>;

    searchLocation(locationSearchCriteria: LocationSearchCriteria): Observable<LocationSearchResult[]>;

    exportProfile(profileExportRequest: ProfileExportRequest): Observable<ProfileExportResponse>;

    importProfile(profileImportRequest: ProfileImportRequest): Observable<ProfileImportResponse>;
}
