export interface CheckUserExistsRequest {
    matching: {
        key: string;
        value: string;
    };
    captchaResponseToken?: string;
}
