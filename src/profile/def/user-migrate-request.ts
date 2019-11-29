export interface UserMigrateRequest {
    userId: string;
    externalId?: string;
    channel?: string;
    action: 'reject' | 'accept';
    feedId?: string;
}
