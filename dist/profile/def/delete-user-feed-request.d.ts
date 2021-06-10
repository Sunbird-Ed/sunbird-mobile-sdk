import { UserFeedCategory } from './profile';
export interface DeleteUserFeedRequest {
    feedEntryId: string;
    category: UserFeedCategory;
}
