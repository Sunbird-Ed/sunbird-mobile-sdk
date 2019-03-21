import { ApiRequestHandler } from '../../api';
import { CategoryTerm, FrameworkService, FrameworkUtilService, GetFrameworkCategoryTermsRequest } from '..';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class GetFrameworkCategoryTermsHandler implements ApiRequestHandler<GetFrameworkCategoryTermsRequest, CategoryTerm[]> {
    private frameworkUtilService;
    private frameworkService;
    private sharedPreferences;
    constructor(frameworkUtilService: FrameworkUtilService, frameworkService: FrameworkService, sharedPreferences: SharedPreferences);
    handle(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
    private getActiveChannelTranslatedDefaultFrameworkDetails;
    private getTranslatedFrameworkDetails;
    private getAllCategoriesTermsSet;
    private getCategoryTerms;
    private getCategoryAssociationTerms;
}
