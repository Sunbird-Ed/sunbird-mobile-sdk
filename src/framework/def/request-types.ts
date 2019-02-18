import {FrameworkCategory} from './framework-category';

export interface ChannelDetailsRequest {
    channelId: string;
}

export interface FrameworkDetailsRequest {
    frameworkId: string;
    categories: FrameworkCategory[];
}

export interface OrganizationSearchCriteria<T> {
    filters: {
        isRootOrg: boolean;
    };
    fields: (keyof T)[];
}


