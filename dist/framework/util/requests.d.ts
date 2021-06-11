import { FrameworkCategoryCode } from '..';
import { CachedItemRequest } from '../../key-value-store';
export interface GetDefaultChannelDetailsRequest extends CachedItemRequest {
}
export interface GetActiveChannelRequest extends CachedItemRequest {
}
export interface GetSuggestedFrameworksRequest extends CachedItemRequest {
    language: string;
    requiredCategories: FrameworkCategoryCode[];
    ignoreActiveChannel?: boolean;
}
export interface GetFrameworkCategoryTermsRequest extends CachedItemRequest {
    frameworkId?: string;
    requiredCategories: FrameworkCategoryCode[];
    currentCategoryCode: string;
    prevCategoryCode?: string;
    selectedTermsCodes?: string[];
    language: string;
}
