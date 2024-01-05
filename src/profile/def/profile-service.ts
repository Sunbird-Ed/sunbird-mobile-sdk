import {Profile, ProfileSource, UserFeedEntry} from './profile';
import {Observable} from 'rxjs';
import {TenantInfo} from './tenant-info';
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
import {ProfileExportRequest} from './profile-export-request';
import {ProfileExportResponse} from './profile-export-response';
import {ProfileImportRequest} from './profile-import-request';
import {ProfileImportResponse} from './profile-import-response';
import {SdkServicePreInitDelegate} from '../../sdk-service-pre-init-delegate';
import {TenantInfoRequest} from './tenant-info-request';
import {MergeServerProfilesRequest} from './merge-server-profiles-request';
import {UserMigrateResponse} from './user-migrate-response';
import {UserMigrateRequest} from './user-migrate-request';
import {ManagedProfileManager} from '../handler/managed-profile-manager';
import {CheckUserExistsResponse} from './check-user-exists-response';
import {CheckUserExistsRequest} from './check-user-exists-request';
import {UpdateServerProfileDeclarationsResponse} from './update-server-profile-declarations-response';
import {UpdateServerProfileDeclarationsRequest} from './update-server-profile-declarations-request';
import {Consent} from '@project-sunbird/client-services/models';
import {ReadConsentResponse, UpdateConsentResponse} from '@project-sunbird/client-services/services/user';
import {UpdateUserFeedRequest} from './update-user-feed-request';
import {DeleteUserFeedRequest} from './delete-user-feed-request';
import {UpdateServerProfileResponse} from './update-server-profile-response';

export {Consent} from '@project-sunbird/client-services/models';
export {ReadConsentResponse, UpdateConsentResponse} from '@project-sunbird/client-services/services/user';

export interface ProfileService extends SdkServicePreInitDelegate {
    readonly managedProfileManager: ManagedProfileManager;

    checkServerProfileExists(request: CheckUserExistsRequest): Observable<CheckUserExistsResponse>;

    createProfile(profile: Profile, profileSource: ProfileSource): Observable<Profile>;

    deleteProfile(uid: string): Observable<undefined>;

    updateProfile(profile: Profile): Observable<Profile>;

    updateServerProfile(updateServerProfileRequest: UpdateServerProfileInfoRequest): Observable<UpdateServerProfileResponse>;

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo>;

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]>;

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile>;

    getActiveSessionProfile(activeSessionProfileRequest: Pick<ServerProfileDetailsRequest, 'requiredFields'>): Observable<Profile>;

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

    mergeServerProfiles(mergeServerProfilesRequest: MergeServerProfilesRequest): Observable<undefined>;

    isDefaultChannelProfile(): Observable<boolean>;

    getUserFeed(): Observable<UserFeedEntry[]>;

    updateUserFeedEntry(
        updateUserFeedRequest: UpdateUserFeedRequest
    ): Observable<boolean>;

    deleteUserFeedEntry(
        deleteUserFeedRequest: DeleteUserFeedRequest
    ): Observable<boolean>;

    userMigrate(userMigrateRequest: UserMigrateRequest): Observable<UserMigrateResponse>;

    updateServerProfileDeclarations(updateServerProfileDeclarationsRequest: UpdateServerProfileDeclarationsRequest): Observable<UpdateServerProfileDeclarationsResponse>;

    updateConsent(userConsent: Consent): Observable<UpdateConsentResponse>;

    getConsent(userConsent: Consent): Observable<ReadConsentResponse>;

    deleteProfileData(uid: string): Observable<boolean>;
}
