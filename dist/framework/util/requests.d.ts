import { FrameworkCategoryCode } from '..';
export interface GetSuggestedFrameworksRequest {
    language: string;
    requiredCategories: FrameworkCategoryCode[];
    ignoreActiveChannel?: boolean;
}
export interface GetFrameworkCategoryTermsRequest {
    frameworkId?: string;
    requiredCategories: FrameworkCategoryCode[];
    currentCategoryCode: string;
    prevCategoryCode?: string;
    selectedTermsCodes?: string[];
    language: string;
}
