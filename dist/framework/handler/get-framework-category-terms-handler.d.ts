import { ApiRequestHandler } from '../../api';
import { CategoryTerm, FrameworkService, FrameworkUtilService, GetFrameworkCategoryTermsRequest } from '..';
import { Observable } from 'rxjs';
export declare class GetFrameworkCategoryTermsHandler implements ApiRequestHandler<GetFrameworkCategoryTermsRequest, CategoryTerm[]> {
    private frameworkUtilService;
    private frameworkService;
    constructor(frameworkUtilService: FrameworkUtilService, frameworkService: FrameworkService);
    handle(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
    private getActiveChannelTranslatedDefaultFrameworkDetails;
    private getTranslatedFrameworkDetails;
    private getAllCategoriesTermsSet;
    private getCategoryTerms;
    private getCategoryAssociationTerms;
}
