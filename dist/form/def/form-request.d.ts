import { CachedItemRequest } from '../../key-value-store';
export interface FormRequest extends CachedItemRequest {
    type: string;
    subType: string;
    action: string;
    component?: string;
    rootOrgId?: string;
    framework?: string;
}
