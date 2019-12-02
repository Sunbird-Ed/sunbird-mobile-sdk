export interface UserMigrateRequest {
    userId: string;
    userExtId?: string;
    channel?: string;
    action: 'reject' | 'accept';
    feedId?: string;
}
