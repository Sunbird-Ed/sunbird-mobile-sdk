import { Observable } from 'rxjs';
import { CategoryTerm, Channel, Framework, GetFrameworkCategoryTermsRequest } from '..';
import { GetSuggestedFrameworksRequest } from './requests';
export interface FrameworkUtilService {
    getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest): Observable<Framework[]>;
    getFrameworkCategoryTerms(getFrameworkCategoriesRequest: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
    getCustodianChannel(): Observable<Channel>;
}
