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
    ageGroup?: Array<string>;
    ownership?: Array<string>;
    dialcodes?: string;
}
export interface PageAssembleCriteria extends CachedItemRequest {
    name: PageName;
    source?: 'app' | 'web';
    mode?: 'soft' | 'hard';
    filters?: PageAssembleFilter;
}
export declare enum PageName {
    RESOURCE = "Resource",
    COURSE = "Course",
    DIAL_CODE = "DIAL Code Consumption"
}
