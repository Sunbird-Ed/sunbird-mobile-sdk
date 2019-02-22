export interface ServerProfileSearchCriteria {
    query?: string;
    filters: {
        identifier?: Set<string>;
    };
    fields?: string[];
    offset?: number;
    limit?: number;
}
