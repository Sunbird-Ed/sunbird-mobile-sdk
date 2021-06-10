import { CachedItemRequest } from '../../key-value-store';
export interface GetManagedServerProfilesRequest extends CachedItemRequest {
    requiredFields: string[];
}
