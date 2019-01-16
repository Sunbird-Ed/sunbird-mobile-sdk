export interface UserProfileDetailsRequest {
    userId: string;
    requiredFields: string[];
    refreshUserProfileDetails: boolean;
    returnRefreshedUserProfileDetails: boolean;
}
