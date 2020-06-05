import {ApiRequestHandler} from '../../api';
import {
    CategoryAssociation,
    CategoryTerm,
    Channel,
    Framework,
    FrameworkCategory,
    FrameworkCategoryCode,
    FrameworkService,
    FrameworkUtilService,
    GetFrameworkCategoryTermsRequest
} from '..';
import {Observable} from 'rxjs';
import Set from 'typescript-collections/dist/lib/Set';
import {makeString} from 'typescript-collections/dist/lib/util';
import {FrameworkMapper} from '../util/framework-mapper';
import {SharedPreferences} from '../../util/shared-preferences';
import {FrameworkKeys} from '../../preference-keys';
import {map, mergeMap, tap} from 'rxjs/operators';
import {CachedItemRequestSourceFrom} from '../../key-value-store';

export class GetFrameworkCategoryTermsHandler implements ApiRequestHandler<GetFrameworkCategoryTermsRequest, CategoryTerm[]> {

    constructor(private frameworkUtilService: FrameworkUtilService,
                private frameworkService: FrameworkService,
                private sharedPreferences: SharedPreferences) {
    }

    handle(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]> {
        return ((() => {
            if (request.frameworkId) {
                return this.getTranslatedFrameworkDetails(request.frameworkId, request.requiredCategories, request.language);
            }

            return this.getActiveChannelTranslatedDefaultFrameworkDetails(request);
        }) as () => Observable<Framework>)().pipe(
            tap(async (framework: Framework) =>
                await this.sharedPreferences.putString(
                    FrameworkKeys.KEY_ACTIVE_CHANNEL_ACTIVE_FRAMEWORK_ID, framework.identifier
                ).toPromise()
            ),
            map((framework: Framework) => {
                let terms: CategoryTerm[] = [];

                if (!request.prevCategoryCode && request.currentCategoryCode) {
                    terms = this.getCategoryTerms(framework, request).toArray();
                } else {
                    terms = this.getCategoryAssociationTerms(framework, request).toArray();
                }
                if (request.currentCategoryCode === 'gradeLevel') {
                    const maxIndex: number = terms.reduce((acc, val) => (val.index && (val.index > acc)) ? val.index : acc, 0);

                    terms.sort((i, j) => (i.index || maxIndex + 1) - (j.index || maxIndex + 1));
                } else {
                    terms.sort((i, j) => i.name.localeCompare(j.name));
                }
                const othersOptionIndex = terms.indexOf(terms.find(val => val.name === 'Others')!);
                if ( othersOptionIndex >= 0 && othersOptionIndex !== terms.length) {
                       const temp = terms[terms.length - 1];
                       terms[terms.length - 1] = terms[othersOptionIndex];
                       terms[othersOptionIndex] = temp;
                }
                return terms;
            })
        );
    }

    private getActiveChannelTranslatedDefaultFrameworkDetails(
        request: GetFrameworkCategoryTermsRequest
    ): Observable<Framework> {
        return this.frameworkUtilService.getActiveChannel({ from: request.from }).pipe(
            mergeMap((channel: Channel) => {
                return this.getTranslatedFrameworkDetails(
                    channel.defaultFramework, request.requiredCategories, request.language, request.from
                );
            })
        );
    }

    private getTranslatedFrameworkDetails(
        frameworkId: string,
        requiredCategories: FrameworkCategoryCode[],
        language: string,
        from?: CachedItemRequestSourceFrom,
    ): Observable<Framework> {
        return this.frameworkService.getFrameworkDetails({
            from,
            frameworkId,
            requiredCategories
        }).pipe(
            map((f) => FrameworkMapper.prepareFrameworkTranslations(f, language))
        );
    }

    private getAllCategoriesTermsSet(framework: Framework): Set<CategoryTerm> {
        if (!framework.categories) {
            return new Set<CategoryTerm>();
        }

        return framework.categories
            .reduce((acc: CategoryTerm[][], category: FrameworkCategory) => [...acc, category.terms || []], [])
            .reduce((acc, val) => acc.concat(val), [])
            .reduce((acc, val) => {
                    acc.add(val);
                    return acc;
                }, new Set<CategoryTerm>((term) => makeString(term))
            );
    }

    private getCategoryTerms(framework: Framework, request: GetFrameworkCategoryTermsRequest): Set<CategoryTerm> {
        return framework.categories!.find((category) => category.code === request.currentCategoryCode)!.terms!
            .reduce((acc, val) => {
                    acc.add(val!);
                    return acc;
                }, new Set<CategoryTerm>((term) => makeString(term))
            );
    }

    private getCategoryAssociationTerms(framework: Framework, request: GetFrameworkCategoryTermsRequest): Set<CategoryTerm> {
        if (!framework.categories) {
            return new Set<CategoryTerm>();
        }

        const categoryTerms = framework.categories.find((category) => category.code === request.prevCategoryCode)!.terms;
        if (!categoryTerms) {
            return new Set<CategoryTerm>();
        }

        const categoryAssociationsArray: CategoryAssociation[][] = categoryTerms
            .filter((term) => request.selectedTermsCodes!.find((selectedTerm) => selectedTerm === term.code))
            .map((term) => term.associations || []);

        if (categoryAssociationsArray.some((categoryAssociations) => categoryAssociations.length === 0)) {
            return framework.categories!.find((category) => category.code === request.currentCategoryCode)!.terms!
                .reduce((acc, val) => {
                        acc.add(val!);
                        return acc;
                    }, new Set<CategoryTerm>((term) => makeString(term))
                );
        } else {
            return categoryAssociationsArray
                .reduce((acc, val) => acc.concat(val), [])
                .reduce((acc, val) => {
                        acc.add(val);
                        return acc;
                    }, new Set<CategoryAssociation>((term) => makeString(term))
                )
                .toArray()
                .map((association: CategoryAssociation) =>
                    this.getAllCategoriesTermsSet(framework).toArray().find((term) =>
                        term.identifier === association.identifier
                    )
                )
                .reduce((acc, val) => {
                        acc.add(val!);
                        return acc;
                    }, new Set<CategoryTerm>((term) => makeString(term))
                );
        }
    }
}
