export interface AddEntryRequest {
    query: string;
    namespace: string;
}
export interface GetEntriesRequest {
    namespace: string;
    like?: string;
    limit: number;
}
