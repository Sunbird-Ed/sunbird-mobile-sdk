export interface LocationSearchCriteria {
    filters: {
        query?: string;
        type: string;
        parentId?: string;
        code?: string;
        limit?: number;
        offset?: string;
    };
}
