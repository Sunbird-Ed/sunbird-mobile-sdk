export interface DeviceRegisterResponse {
    ts: string;
    result: {
        actions: Array<any>;
    };
}
export interface DeviceProfileResponse {
    userDeclaredLocation: {
        state: string;
        district: string;
    };
    ipLocation: {
        state: string;
        district: string;
    };
}
