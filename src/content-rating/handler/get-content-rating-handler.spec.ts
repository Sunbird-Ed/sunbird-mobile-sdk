import { GetContentRatingOptionsHandler } from './get-content-rating-handler';
import { ApiService, CachedItemStore } from '../..';
import { ContentRatingServiceConfig, GetContentRatingOptionsRequest } from '..';
import { FileService } from '../../util/file/def/file-service';
import { of } from 'rxjs';

describe('GetContentRatingOptionsHandler', () => {
    let getContentRatingOptionsHandler: GetContentRatingOptionsHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockContentRatingServiceConfig: Partial<ContentRatingServiceConfig> = {};
    const mockFileservice: Partial<FileService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        getContentRatingOptionsHandler = new GetContentRatingOptionsHandler(
            mockApiService as ApiService,
            mockContentRatingServiceConfig as ContentRatingServiceConfig,
            mockFileservice as FileService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GetContentRatingOptionsHandler', () => {
        expect(GetContentRatingOptionsHandler).toBeTruthy();
    });

    // it('should fetch data from server', (done) => {
    //     // arrange
    //     const request: GetContentRatingOptionsRequest = {
    //         language: 'english',
    //         ContentRatingUrl: ''
    //     };
    //     mockCachedItemStore.getCached = jest.fn((a, b, c, d, e) => d());
    //     const data = mockApiService.fetch =  jest.fn(() => of({
    //         body: {
    //             result: {
    //                 response: 'SAMPLE_RESPONSE'
    //             },
    //             trim: jest.fn(() => '{"name": "s-name"}')
    //         }
    //     }));

    //     // act
    //     getContentRatingOptionsHandler.handle(request).subscribe(() => {
    //         // assert
    //         expect(mockCachedItemStore.getCached).toHaveBeenCalled();
    //         done();
    //     });
    // });

    it('should fetch data initially from file', (done) => {
        // arrange
        const request: GetContentRatingOptionsRequest = {
            language: 'english',
            ContentRatingUrl: ''
        };
        mockCachedItemStore.getCached = jest.fn((a, b, c, d) => d());
        mockFileservice.readFileFromAssets = jest.fn(() => Promise.resolve('{"uid": "sample-uid"}'));
        // act
        getContentRatingOptionsHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockFileservice.readFileFromAssets).toHaveBeenCalled();
            done();
        });
    });
});
