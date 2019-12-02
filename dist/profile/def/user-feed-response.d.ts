export interface UserFeed {
    id: string;
    userId: string;
    category: string;
    priority: number;
    createdBy: string;
    createdOn: string;
    channel: string;
    status: string;
    expireOn: string;
    data: {
        prospectChannels: Array<string>;
    };
}
export interface UserFeedResponse {
    response: UserFeed[];
}
