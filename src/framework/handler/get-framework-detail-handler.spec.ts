import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {ApiService} from '../../api';
import {of} from 'rxjs';
import {Channel, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig} from '..';
import { GetFrameworkDetailsHandler } from './get-framework-detail-handler';

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

        mockApiService.fetch =  jest.fn().mockImplementation(() => of({ body: {result: framework}}));
        mockCacheItemStore.getCached = jest.fn().mockImplementation((a, b, c, d, e) => d());
        mockFileService.readFileFromAssets = jest.fn().mockImplementation(() => []);
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

        mockApiService.fetch =  jest.fn().mockImplementation(() => of(''));
        mockCacheItemStore.getCached = jest.fn().mockImplementation((a, b, c, d, e) => e());
        mockFileService.readFileFromAssets =  jest.fn().mockImplementation(() => []);
        // act
        getFrameworkDetailsHandler.handle(request).subscribe(() => {
             // assert
            expect(request.frameworkId).toBe('SOME_FRAMEWORK_ID');
            expect(mockCacheItemStore.getCached).toHaveBeenCalled();
            expect(mockFileService.readFileFromAssets).toHaveBeenCalled();

        });
    });

});

