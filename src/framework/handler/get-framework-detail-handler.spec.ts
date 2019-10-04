import {CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiRequestHandler, ApiService, HttpRequestType, Request, HttpClient, HttpSerializer} from '../../api';
import {Observable} from 'rxjs';
import {Channel, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig} from '..';
import {FrameworkMapper} from '../util/framework-mapper';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { GetFrameworkDetailsHandler } from './get-framework-detail-handler';
import {FrameworkCategoryCode} from '..';

describe('GetFrameworkDetailsHandler', () => {
    let getFrameworkDetailsHandler: GetFrameworkDetailsHandler;
    const mockframeworkService: Partial<FrameworkService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockCacheItemStore: Partial<CachedItemStore> = {};
    const mockFrameworkServiceConfig: Partial<FrameworkServiceConfig> = {};

    beforeAll(() => {
        getFrameworkDetailsHandler = new GetFrameworkDetailsHandler(
            mockframeworkService as FrameworkService,
            mockApiService as ApiService,
            mockFrameworkServiceConfig as FrameworkServiceConfig,
            mockFileService as FileService,
            mockCacheItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of GetFrameworkDetailsHandler', () => {
        expect(getFrameworkDetailsHandler).toBeTruthy();
    });

    it('should run handle function from the getFrameworkDetailsHandler', () => {
        // arrange
        const request: FrameworkDetailsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: []
        };

        const GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';

        mockApiService.fetch = jest.fn(() => []);
        mockCacheItemStore.getCached = jest.fn(() => []);
        mockFileService.readFileFromAssets = jest.fn(() => []);
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        getFrameworkDetailsHandler.handle(request).subscribe(() => {
             // assert
            expect(request.frameworkId).toBe('SOME_FRAMEWORK_ID');
            expect(mockCacheItemStore.getCached).toHaveBeenCalled();
            const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(mockFrameworkServiceConfig.frameworkApiPath + GET_FRAMEWORK_DETAILS_ENDPOINT + '/' + request.frameworkId)
            .withParameters({categories: request.requiredCategories.join(',')})
            .withApiToken(true)
            .build();
            expect(apiRequest).toBeTruthy();
            expect(mockApiService.fetch).toHaveBeenCalledWith(apiRequest);
        }, () => {}, () => {
            expect(mockFileService.readFileFromAssets).toHaveBeenCalled();
            expect(mockframeworkService.getDefaultChannelDetails).toHaveBeenCalled();
            expect(mockframeworkService.getFrameworkDetails).toHaveBeenCalledWith('SOME_FRAMEWORK_ID', request.requiredCategories);
        });
    });

});

