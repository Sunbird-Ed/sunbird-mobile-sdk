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

    it('Should run the handle method of getFrameworkCategoryTermsHandler ', () => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: [],
            currentCategoryCode: 'SOME_CATEGORY_CODE',
            language: 'SOME_LANGUAGE',
        };
        mockframeworkService.getFrameworkDetails = jest.fn(() => []);
        (mockframeworkService.getFrameworkDetails as jest.Mock).mockReturnValue(Observable.of({
            name: 'SAMPLE_NAME',
            identifier: 'SAMPLE_ID'
        }));
        mockSharedPreferences.putString = jest.fn(() => Observable.of([]));
        // act
          getFrameworkCategoryTermsHandler.handle(request).subscribe( () => {
               // assert
            expect(request.frameworkId).toBe('SOME_FRAMEWORK_ID');
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(FrameworkKeys.KEY_ACTIVE_CHANNEL_ACTIVE_FRAMEWORK_ID,
                 request.frameworkId);
            expect(mockframeworkUtilService.getActiveChannel).toHaveBeenCalled();
            expect(mockframeworkService.getFrameworkDetails).toHaveBeenCalledWith('SOME_FRAMEWORK_ID', request.requiredCategories);
            // done();
        }, () => {});
    });
});
