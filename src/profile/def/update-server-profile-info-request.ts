export interface UpdateServerProfileInfoRequest {
    userId: string;
    phone?: string;
    email?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    locationCodes?: Array<string>;
    firstName?: string;
    lastName?: string;
    framework?: { [key: string]: any };
    profileSummary?: string;
    recoveryEmail?: string;
    recoveryPhone?: string;
    externalIds?: {
        id: string;
        operation: string;
        idType: string;
        provider: string;
    }[];
    /*
    language?: Array<string>;
    profileSummary?: string;
    subject?: Array<string>;
    gender?: string;
    dob?: string;
    grade?: Array<string>;
    avatar?: string;
    webPages?: Array<UserWebPages>;
    education?: Array<UserEducation>;
    jobProfile?: Array<UserJobProfile>;
    address?: Array<UserAddress>;
     */
}

