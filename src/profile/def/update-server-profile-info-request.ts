export interface UpdateServerProfileInfoRequest {
    userId: string;
    phone?: string;
    emailId?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    locationCodes?: Array<string>;
    firstName?: string;
    lastName?: string;
    framework?: { [key: string]: any };
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

