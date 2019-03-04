export interface SearchRequest {
    filters: SearchFilter;
    fields?: string[];
}

export interface SearchFilter {
    compatibilityLevel: { [key: string]: any };
    identifier: string[];
    status: string[];
    objectType: string[];
}
