import { ContentRatingServiceImpl } from './content-rating-service-impl';
import { SdkConfig, ApiService, CachedItemStore, GetContentRatingOptionsRequest } from '../..';
import { FileService } from '../../util/file/def/file-service';
import { GetContentRatingOptionsHandler } from '../handler/get-content-rating-handler';
import { of } from 'rxjs';

jest.mock('../handler/get-content-rating-handler');

describe('FaqServiceImpl', () => {
    let contentRatingServiceImpl: ContentRatingServiceImpl;
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        contentRatingServiceImpl = new ContentRatingServiceImpl(
            mockSdkConfig as SdkConfig,
            mockFileService as FileService,
            mockApiService as ApiService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ContentRatingServiceImpl', () => {
        expect(contentRatingServiceImpl).toBeTruthy();
    });

    it('should return fap details using GetFaqDetailsHandler', (done) => {
        // arrange
        const request: GetContentRatingOptionsRequest = {
            language: 'english',
            ContentRatingUrl: 'http://contentRating/url'
        };
        (GetContentRatingOptionsHandler as jest.Mock<GetContentRatingOptionsHandler>).mockImplementation(() => {
            return {
                handle: jest.fn().mockImplementation(() => of({}))
            } as Partial<GetContentRatingOptionsHandler> as GetContentRatingOptionsHandler;
        });
        // act
        contentRatingServiceImpl.getContentRatingOptions(request).subscribe(() => {
            // assert
            done();
        });
    });
});
