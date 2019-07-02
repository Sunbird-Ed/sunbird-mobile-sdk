export interface AddEntryRequest {
    searchTerm: string;
    namespace: string;
}

export interface GetEntriesRequest {
    namespace: string;
    like?: string;
    limit: number;
}
