export interface ServerProfileSearchCriteria {
    query?: string;
    offset?: number;
    limit?: number;
    identifiers?: Set<string>;
    fields?: string[];
}
