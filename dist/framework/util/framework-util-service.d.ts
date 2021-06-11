import { Observable } from 'rxjs';
import { CategoryTerm, Channel, Framework, GetActiveChannelRequest, GetFrameworkCategoryTermsRequest } from '..';
import { GetSuggestedFrameworksRequest } from './requests';
export interface FrameworkUtilService {
    getActiveChannel(getActiveChannelRequest?: GetActiveChannelRequest): Observable<Channel>;
    getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest): Observable<Framework[]>;
    /**
     * @param {GetFrameworkCategoryTermsRequest} getFrameworkCategoriesRequest
     *  - @optional frameworkId
     *      - when not present, use active channel default framework
     * */
    getFrameworkCategoryTerms(getFrameworkCategoriesRequest: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
}
