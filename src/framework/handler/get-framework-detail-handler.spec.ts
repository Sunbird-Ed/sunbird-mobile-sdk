import {CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiRequestHandler, ApiService, HttpRequestType, Request, HttpClient, HttpSerializer} from '../../api';
import {of} from 'rxjs';
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

    it('should run handle function from the getFrameworkDetailsHandler including fetchFromServer', () => {
        // arrange
        const request: FrameworkDetailsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: []
        };
        const framework:  Framework = {
            name: 'SOME_NAME',
            identifier: 'SOME_IDENTIFIER'
        };

        const GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';

        mockApiService.fetch =  jest.fn(() => of({ body: {result: framework}}));
        mockCacheItemStore.getCached = jest.fn((a, b, c, d, e) => d());
        mockFileService.readFileFromAssets = jest.fn(() => []);
        spyOn(mockApiService, 'fetch').and.returnValue(of({
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
            expect(mockApiService.fetch).toHaveBeenCalledWith();
        });
    });

    it('should run handle function from the getFrameworkDetailsHandler using fetchFromFile', () => {
        // arrange
        const request: FrameworkDetailsRequest = {
            frameworkId: 'SOME_FRAMEWORK_ID',
            requiredCategories: []
        };
        const framework:  Framework = {
            name: 'SOME_NAME',
            identifier: 'SOME_IDENTIFIER'
        };

        const GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';

        mockApiService.fetch =  jest.fn(() => of(''));
        mockCacheItemStore.getCached = jest.fn((a, b, c, d, e) => e());
        mockFileService.readFileFromAssets =  jest.fn(() => []);
        // act
        getFrameworkDetailsHandler.handle(request).subscribe(() => {
             // assert
            expect(request.frameworkId).toBe('SOME_FRAMEWORK_ID');
            expect(mockCacheItemStore.getCached).toHaveBeenCalled();
            expect(mockFileService.readFileFromAssets).toHaveBeenCalled();

        });
    });

});

