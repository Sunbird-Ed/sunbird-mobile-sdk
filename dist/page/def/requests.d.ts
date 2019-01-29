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
export interface PageAssembleCriteria {
    name: string;
    source?: string;
    mode?: string;
    filters?: PageAssembleFilter;
}
