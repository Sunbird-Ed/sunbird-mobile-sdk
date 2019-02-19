import { ApiRequestHandler } from '../../api';
import { CategoryTerm, FrameworkService, GetFrameworkCategoryTermsRequest } from '..';
import { Observable } from 'rxjs';
export declare class GetFrameworkCategoryTermsHandler implements ApiRequestHandler<GetFrameworkCategoryTermsRequest, CategoryTerm[]> {
    private frameworkService;
    constructor(frameworkService: FrameworkService);
    handle(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
    private getCurrentChannelTranslatedDefaultFrameworkDetails;
    private getTranslatedFrameworkDetails;
    private getAllCategoriesTermsSet;
    private getCategoryTerms;
    private getCategoryAssociationTerms;
}
