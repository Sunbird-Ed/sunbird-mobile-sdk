import {GetFrameworkCategoryTermsHandler} from './get-framework-category-terms-handler';
import {FrameworkService, GetFrameworkCategoryTermsRequest} from '..';
import {Observable} from 'rxjs';
import {sample_data} from './get-framework-category-terms-handler.spec-data';

describe('GetFrameworkCategoryTermsHandler', () => {
    let getFrameworkCategoryTermsHandler: GetFrameworkCategoryTermsHandler;

    beforeEach(() => {
        const frameworkService: FrameworkService = {
            getFrameworkDetails: jest.fn(() => {
                return Observable.of(sample_data);
            })
        } as any;
        getFrameworkCategoryTermsHandler = new GetFrameworkCategoryTermsHandler(frameworkService);
    });

    it('should return terms from current category if prevCategory is not provided', (done) => {
        const request: GetFrameworkCategoryTermsRequest = {
            frameworkId: 'asd',
            requiredCategories: [],
            currentCategoryCode: 'board',
            language: '',
        };

        getFrameworkCategoryTermsHandler.handle(request).subscribe((terms) => {
            expect(terms).toEqual([
                expect.objectContaining({
                    identifier: 'mh_k-12_15_board_statemaharashtra'
                })
            ]);

            done();
        });
    });

    describe('should return associated terms from selected terms', () => {
        it('if no associations for any of the selected term, return current category terms', (done) => {
            const request: GetFrameworkCategoryTermsRequest = {
                frameworkId: 'asd',
                prevCategoryCode: 'board',
                currentCategoryCode: 'medium',
                selectedTermsCodes: ['statemaharashtra'],
                requiredCategories: [],
                language: '',
            };

            getFrameworkCategoryTermsHandler.handle(request).subscribe((terms) => {
                expect(terms.length).toEqual(8);

                expect(terms).toEqual([
                    expect.objectContaining({
                        code: 'marathi'
                    }),
                    expect.objectContaining({
                        code: 'hindi'
                    }),
                    expect.objectContaining({
                        code: 'urdu'
                    }),
                    expect.objectContaining({
                        code: 'sindhi'
                    }),
                    expect.objectContaining({
                        code: 'gujarati'
                    }),
                    expect.objectContaining({
                        code: 'telugu'
                    }),
                    expect.objectContaining({
                        code: 'kannada'
                    }),
                    expect.objectContaining({
                        code: 'english'
                    })
                ]);

                done();
            });
        });

        it('if associations exist for all selected term, return associated terms', (done) => {
            const request: GetFrameworkCategoryTermsRequest = {
                frameworkId: 'asd',
                prevCategoryCode: 'medium',
                currentCategoryCode: 'gradeLevel',
                selectedTermsCodes: ['english'],
                requiredCategories: [],
                language: 'de',
            };

            getFrameworkCategoryTermsHandler.handle(request).subscribe((terms) => {
                expect(terms.length).toEqual(8);

                expect(terms).toEqual([
                    expect.objectContaining({
                        code: 'class2'
                    }),
                    expect.objectContaining({
                        code: 'class3',
                        name: 'clazz3'
                    }),
                    expect.objectContaining({
                        code: 'class4'
                    }),
                    expect.objectContaining({
                        code: 'class5'
                    }),
                    expect.objectContaining({
                        code: 'class6'
                    }),
                    expect.objectContaining({
                        code: 'class7'
                    }),
                    expect.objectContaining({
                        code: 'class9'
                    }),
                    expect.objectContaining({
                        code: 'class10'
                    })
                ]);

                done();
            });
        });
    });
});
