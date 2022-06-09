import {FrameworkCategoryCode} from './framework-category-code';
import {CachedItemRequest} from '../../key-value-store';

export interface ChannelDetailsRequest extends CachedItemRequest {
    channelId: string;
}

export interface FrameworkDetailsRequest extends CachedItemRequest {
    frameworkId?: string;
    requiredCategories: FrameworkCategoryCode[];
}

export interface OrganizationSearchCriteria<T> {
    filters: {
        isRootOrg?: boolean;
        locationIds?: string[];
        slug?: string;
        'orgLocation.id'?: string;
        isSchool?: boolean;
        isTenant?: boolean;
    };
    fields?: (keyof T)[];
}


