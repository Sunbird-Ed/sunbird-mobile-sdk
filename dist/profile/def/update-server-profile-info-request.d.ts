export interface UpdateServerProfileInfoRequest {
    userId: string;
    phone?: string;
    email?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    locationCodes?: Array<string>;
    firstName?: string;
    lastName?: string;
    framework?: {
        [key: string]: any;
    };
    profileSummary?: string;
    recoveryEmail?: string;
    recoveryPhone?: string;
}
