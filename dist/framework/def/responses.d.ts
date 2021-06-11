import { Organization } from './organization';
export interface OrganizationSearchResponse<T extends Partial<Organization>> {
    count: number;
    content: T[];
}
