import { CachedItemRequest } from '../../key-value-store';

export interface PageAssembleFilter {
    subject?: Array<string>;
    board?: Array<string>;
    domain?: Array<string>;
    medium?: Array<string>;
    gradeLevel?: Array<string>;
    language?: Array<string>;
    concepts?: Array<string>;
    contentType?: Array<string>;
    primaryCategory?: Array<string>;
    ageGroup?: Array<string>;
    ownership?: Array<string>;
    dialcodes?: string;
    'batches.createdFor'?: string[];
}

export interface PageAssembleProfile {
    board: string[];
}
export interface SetPageAssembleChannelRequest {
    channelId: string;
}

export interface PageAssembleCriteria extends CachedItemRequest {
    organisationId?: string;
    name: PageName;
    source?: 'app' | 'web';
    mode?: 'soft' | 'hard';
    filters?: PageAssembleFilter;
    userProfile?: PageAssembleProfile;
    sections?: {
        [sectionId: string]: {
            filters?: PageAssembleFilter
        }
    };
}

export enum PageName {
    RESOURCE = 'Resource',
    COURSE = 'Course',
    ANONYMOUS_COURSE = 'AnonymousCourse',
    DIAL_CODE = 'DIAL Code Consumption',
}
