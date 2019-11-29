export interface UserMigrateResponse {
    userId: string;
    externalId?: string;
    channel?: string;
    action: string;
    feedId?: string;
}
