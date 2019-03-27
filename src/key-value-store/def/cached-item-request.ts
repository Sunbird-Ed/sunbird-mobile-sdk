export enum CachedItemRequestSourceFrom {
    SERVER = 'server',
    CACHE = 'cache'
}

export interface CachedItemRequest {
    from?: CachedItemRequestSourceFrom;
}
