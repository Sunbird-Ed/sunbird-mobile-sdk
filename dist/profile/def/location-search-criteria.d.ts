import { CachedItemRequest } from '../../key-value-store';
export interface LocationSearchCriteria extends CachedItemRequest {
    filters: {
        query?: string;
        type: string;
        parentId?: string;
        code?: string;
        limit?: number;
        offset?: string;
    };
}
