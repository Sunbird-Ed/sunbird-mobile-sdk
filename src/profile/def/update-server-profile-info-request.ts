export interface UpdateServerProfileInfoRequest {
    userId: string;
    phone?: string;
    emailId?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    // frameWork: { [key: string]: any };
    /*
    firstName?: string;
    lastName?: string;
    language?: Array<string>;
    profileSummary?: string;
    subject?: Array<string>;
    gender?: string;
    dob?: string;
    grade?: Array<string>;
    location?: string;
    avatar?: string;
    webPages?: Array<UserWebPages>;
    education?: Array<UserEducation>;
    jobProfile?: Array<UserJobProfile>;
    address?: Array<UserAddress>;
     */
}

