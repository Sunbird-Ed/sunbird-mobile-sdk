import {FrameworkCategoryCode} from './framework-category-code';

export interface ChannelDetailsRequest {
    channelId: string;
}

export interface FrameworkDetailsRequest {
    frameworkId: string;
    requiredCategories: FrameworkCategoryCode[];
}
