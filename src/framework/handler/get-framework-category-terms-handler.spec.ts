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
import {of} from 'rxjs';
import * as Collections from 'typescript-collections';
import {FrameworkMapper} from '../util/framework-mapper';
import {SharedPreferences} from '../../util/shared-preferences';
import {FrameworkKeys} from '../../preference-keys';
import { FrameworkUtilServiceImpl } from '../util/framework-util-service-impl';
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
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
        };
        const response: Framework = {
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
         mockframeworkService.getFrameworkDetails = jest.fn(() => of(response));
         mockSharedPreferences.putString = jest.fn(() => of(undefined));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkService.getFrameworkDetails)
               .toHaveBeenCalledWith({'frameworkId': 'SOME_FRAMEWORK_ID', 'requiredCategories': []});
             expect(mockSharedPreferences.putString).toHaveBeenCalled();
             done();
        });
    });

    it('Should translate framework details on getActiveChannelTranslatedDefaultFrameworkDetails()', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            requiredCategories: [],
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
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
        mockframeworkUtilService.getActiveChannel = jest.fn(() => of(response));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
               expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
             done();
        }, () => {});
    });
});
