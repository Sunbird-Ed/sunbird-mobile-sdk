import {FrameworkCategory} from './framework-category';

export interface ChannelDetailsRequest {
    channelId: string;
}

export interface FrameworkDetailsRequest {
    frameworkId: string;
    categories: FrameworkCategory[];
}


