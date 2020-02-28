export interface GenerateOtpRequest {
    userId?: string;
    templateId?: string;
    key: string;
    type: string;
}
