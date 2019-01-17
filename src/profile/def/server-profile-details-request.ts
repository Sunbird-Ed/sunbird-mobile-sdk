export interface ServerProfileDetailsRequest {
    userId: string;
    requiredFields: string[];
    refreshUserProfileDetails: boolean;
    returnRefreshedUserProfileDetails: boolean;
}
