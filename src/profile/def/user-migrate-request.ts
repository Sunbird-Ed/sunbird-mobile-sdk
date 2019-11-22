export interface UserMigrateRequest {
    userId: string;
    externalId?: string;
    channel?: string;
    action: string;
    feedId?: string;
}
