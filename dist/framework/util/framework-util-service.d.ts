import { Observable } from 'rxjs';
import { CategoryTerm, Channel, Framework, GetFrameworkCategoryTermsRequest } from '..';
import { GetSuggestedFrameworksRequest } from './requests';
export interface FrameworkUtilService {
    getActiveChannel(): Observable<Channel>;
    getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest): Observable<Framework[]>;
    getFrameworkCategoryTerms(getFrameworkCategoriesRequest: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
}
