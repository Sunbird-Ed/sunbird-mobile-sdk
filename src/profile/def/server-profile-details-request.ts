import {CachedItemRequest} from '../../key-value-store';

export interface ServerProfileDetailsRequest extends CachedItemRequest {
    userId: string;
    requiredFields: string[];
    forceRefresh?: boolean;
}
