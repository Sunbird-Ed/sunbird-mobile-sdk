export interface UpdateServerProfileInfoRequest {
    userId: string;
    phone?: string;
    emailId?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
}
