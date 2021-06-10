import { CsUpdateUserFeedRequest } from '@project-sunbird/client-services/services/user';
import { UserFeedCategory } from './profile';
export interface UpdateUserFeedRequest {
    feedEntryId: string;
    category: UserFeedCategory;
    request: CsUpdateUserFeedRequest;
}
