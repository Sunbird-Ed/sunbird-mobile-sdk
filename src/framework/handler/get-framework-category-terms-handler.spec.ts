import {
    Channel,
    Framework,
    FrameworkCategoryCode,
    FrameworkService,
    FrameworkUtilService,
    GetFrameworkCategoryTermsRequest
} from '..';
import {of} from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import { GetFrameworkCategoryTermsHandler } from './get-framework-category-terms-handler';
import { instance, mock } from 'ts-mockito';

describe('GetFrameworkCategoryTermsHandler', () => {
    let getFrameworkCategoryTermsHandler: GetFrameworkCategoryTermsHandler;
    const mockframeworkService: Partial<FrameworkService> = {};
    const mockframeworkUtilService: Partial<FrameworkUtilService> = {};
    const mockSharedPreferences: SharedPreferences = instance(mock<SharedPreferences>());

    beforeAll(() => {
        getFrameworkCategoryTermsHandler = new GetFrameworkCategoryTermsHandler(
            mockframeworkUtilService as FrameworkUtilService,
            mockframeworkService as FrameworkService,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of getFrameworkCategoryTermsHandler', () => {
        expect(getFrameworkCategoryTermsHandler).toBeTruthy();
    });

    it('Should run the handle method of getFrameworkCategoryTermsHandler ', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: [],
            currentCategoryCode: 'gradeLevel',
            language: 'SOME_LANGUAGE',
        };
        const response: Framework = {
            name: 'sample-name',
            identifier: 'sample-id',
            categories: [{
                identifier: 'sample-id',
                code: 'gradeLevel',
                name: 'sample-name',
                description: 'des',
                index: 1,
                status: '2',
                terms: [{
                    identifier: 'sample-id-1',
                    code: 'class 1',
                    name: 'class 1',
                    index: 1,
                    category: 'sam',
                    status: '2',
                }, {
                    identifier: 'sample-id-2',
                    code: 'class 2',
                    name: 'Others',
                    index: 2,
                    category: 'sam',
                    status: '2',
                }, {
                    identifier: 'sample-id-3',
                    code: 'class 3',
                    name: 'class 3',
                    index: 3,
                    category: 'sam',
                    status: '2',
                }]
            }]
        };
         mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(response));
         mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkService.getFrameworkDetails)
               .toHaveBeenCalledWith({'frameworkId': 'SOME_FRAMEWORK_ID', 'requiredCategories': []});
             expect(mockSharedPreferences.putString).toHaveBeenCalled();
             done();
        });
    });

    it('Should run the handle method of getFrameworkCategoryTermsHandler ', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: [],
            currentCategoryCode: 'board',
            language: 'SOME_LANGUAGE',
        };
        const response: Framework = {
            name: 'sample-name',
            identifier: 'sample-id',
            categories: [{
                identifier: 'sample-id',
                code: 'board',
                name: 'sample-name',
                description: 'des',
                index: 1,
                status: '2',
                terms: [{
                    identifier: 'sample-id-1',
                    code: 'class 1',
                    name: 'class 1',
                    index: 1,
                    category: 'sam',
                    status: '2',
                }, {
                    identifier: 'sample-id-2',
                    code: 'class 2',
                    name: 'Others',
                    index: 2,
                    category: 'sam',
                    status: '2',
                }, {
                    identifier: 'sample-id-3',
                    code: 'class 3',
                    name: 'class 3',
                    index: 3,
                    category: 'sam',
                    status: '2',
                }]
            }]
        };
         mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(response));
         mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkService.getFrameworkDetails)
               .toHaveBeenCalledWith({'frameworkId': 'SOME_FRAMEWORK_ID', 'requiredCategories': []});
             expect(mockSharedPreferences.putString).toHaveBeenCalled();
             done();
        });
    });

    it('Should run the handle method of getFrameworkCategoryTermsHandler if framework categories is undefined ', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: [],
            currentCategoryCode: 'gradeLevel',
            language: 'SOME_LANGUAGE',
            prevCategoryCode: 'class'
        };
        const response: Framework = {
            name: 'sample-name',
            identifier: 'sample-id'
        };
         mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(response));
         mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkService.getFrameworkDetails)
               .toHaveBeenCalledWith({'frameworkId': 'SOME_FRAMEWORK_ID', 'requiredCategories': []});
             expect(mockSharedPreferences.putString).toHaveBeenCalled();
             done();
        });
    });

    it('Should translate framework details if terms is undefiend on getActiveChannelTranslatedDefaultFrameworkDetails()', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            requiredCategories: [],
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
            prevCategoryCode: 'SOME_CATEGORY_CODE',
            selectedTermsCodes: ['code']
        };
        const response: Channel = {
            identifier: 'sample-id',
            code: 'SOME_CATEGORY_CODE',
            consumerId: 'consumer-id',
            channel: 'sample-channel',
            description: 'sample-des',
            createdOn: 'creator',
            versionKey: 'sample-ver-key',
            appId: 'sample-app-id',
            name: 'sample-name',
            lastUpdatedOn: 'updated-on: 20202/01/01',
            defaultFramework: 'deft-frm',
            status: '2',
            frameworks: [
                {
                    name: 'sample-name',
                    identifier: 'sample-id',
                    categories: [{
                        identifier: 'sample-id',
                        code: 'SOME_CATEGORY_CODE',
                        name: 'sample-name',
                        description: 'des',
                        index: 1,
                        status: '2',
                        terms: [{
                            identifier: 'sample-id',
                            code: 'code',
                            name: 'name',
                            index: 1,
                            category: 'sam',
                            status: '2',
                            associations: [{
                                identifier: 'sample-id',
                                code: 'SOME_CATEGORY_CODE',
                                name: 'sample-name',
                                category: 'des',
                                status: '2',
                            }]
                        }]
                    }]
                }
            ]
        };
        const frameworkResponse: Framework = {
            name: 'sample-name',
            identifier: 'sample-id',
            categories: [{
                identifier: 'sample-id',
                code: 'SOME_CATEGORY_CODE',
                name: 'sample-name',
                description: 'des',
                index: 1,
                status: '2'
            }]
        };
        mockframeworkUtilService.getActiveChannel = jest.fn().mockImplementation(() => of(response));
        mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(frameworkResponse));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
             done();
        });
    });

    it('Should translate framework details on getActiveChannelTranslatedDefaultFrameworkDetails()', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            requiredCategories: [],
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
            prevCategoryCode: 'SOME_CATEGORY_CODE',
            selectedTermsCodes: ['code']
        };
        const response: Channel = {
            identifier: 'sample-id',
            code: 'SOME_CATEGORY_CODE',
            consumerId: 'consumer-id',
            channel: 'sample-channel',
            description: 'sample-des',
            createdOn: 'creator',
            versionKey: 'sample-ver-key',
            appId: 'sample-app-id',
            name: 'sample-name',
            lastUpdatedOn: 'updated-on: 20202/01/01',
            defaultFramework: 'deft-frm',
            status: '2',
            frameworks: [
                {
                    name: 'sample-name',
                    identifier: 'sample-id',
                    categories: [{
                        identifier: 'sample-id',
                        code: 'SOME_CATEGORY_CODE',
                        name: 'sample-name',
                        description: 'des',
                        index: 1,
                        status: '2',
                        terms: [{
                            identifier: 'sample-id',
                            code: 'code',
                            name: 'name',
                            index: 1,
                            category: 'sam',
                            status: '2',
                            associations: [{
                                identifier: 'sample-id',
                                code: 'SOME_CATEGORY_CODE',
                                name: 'sample-name',
                                category: 'des',
                                status: '2',
                            }]
                        }]
                    }]
                }
            ]
        };
        const frameworkResponse: Framework = {
            name: 'sample-name',
            identifier: 'sample-id',
            categories: [{
                identifier: 'sample-id',
                code: 'SOME_CATEGORY_CODE',
                name: 'sample-name',
                description: 'des',
                index: 1,
                status: '2',
                terms: [{
                    identifier: 'sample-id',
                    code: 'code',
                    name: 'name',
                    index: 1,
                    category: 'sam',
                    status: '2',
                }]
            }]
        };
        mockframeworkUtilService.getActiveChannel = jest.fn().mockImplementation(() => of(response));
        mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(frameworkResponse));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
             done();
        });
    });

    it('Should return CategoriesTermsSet for else part on getCategoryAssociationTerms', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            requiredCategories: [FrameworkCategoryCode.BOARD, FrameworkCategoryCode.MEDIUM],
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
            prevCategoryCode: 'SOME_CATEGORY_CODE',
            selectedTermsCodes: ['code', 'code']
        };
        const response: Channel = {
            identifier: 'sample-id',
            code: 'SOME_CATEGORY_CODE',
            consumerId: 'consumer-id',
            channel: 'sample-channel',
            description: 'sample-des',
            createdOn: 'creator',
            versionKey: 'sample-ver-key',
            appId: 'sample-app-id',
            name: 'sample-name',
            lastUpdatedOn: 'updated-on: 20202/01/01',
            defaultFramework: 'deft-frm',
            status: '2',
            frameworks: [
                {
                    name: 'sample-name',
                    identifier: 'sample-id',
                    categories: [{
                        identifier: 'sample-id',
                        code: 'SOME_CATEGORY_CODE',
                        name: 'sample-name',
                        description: 'des',
                        index: 1,
                        status: '2',
                        terms: [{
                            identifier: 'sample-id',
                            code: 'code',
                            name: 'name',
                            index: 1,
                            category: 'sam',
                            status: '2',
                            associations: [{
                                identifier: 'sample-id',
                                code: 'SOME_CATEGORY_CODE',
                                name: 'sample-name',
                                category: 'des',
                                status: '2',
                            }]
                        }]
                    }]
                }
            ]
        };
        const frameworkResponse: Framework = {
            name: 'sample-name',
            identifier: 'sample-id',
            categories: [{
                identifier: 'sample-id',
                code: 'SOME_CATEGORY_CODE',
                name: 'sample-name',
                description: 'des',
                index: 1,
                status: '2',
                terms: [{
                    identifier: 'sample-id',
                    code: 'code',
                    name: 'name',
                    index: 1,
                    category: 'sam',
                    status: '2',
                    associations: [{
                        identifier: 'sample-id',
                        code: 'SOME_CATEGORY_CODE',
                        name: 'sample-name',
                        category: 'des',
                        status: '2',
                    }]
                }]
            }]
        };
        mockframeworkUtilService.getActiveChannel = jest.fn().mockImplementation(() => of(response));
        mockframeworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(frameworkResponse));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
               expect(mockSharedPreferences.putString).toHaveBeenCalled();
             done();
        });
    });
});
