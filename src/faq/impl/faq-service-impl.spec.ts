import { FaqServiceImpl } from './faq-service-impl';
import { SdkConfig, ApiService, CachedItemStore, GetFaqRequest } from '../..';
import { FileService } from '../../util/file/def/file-service';
import { GetFaqDetailsHandler } from '../handler/get-faq-details-handler';
import { of } from 'rxjs';

jest.mock('../handler/get-faq-details-handler');

describe('FaqServiceImpl', () => {
    let faqServiceImpl: FaqServiceImpl;
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        faqServiceImpl = new FaqServiceImpl(
            mockSdkConfig as SdkConfig,
            mockFileService as FileService,
            mockApiService as ApiService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of FaqServiceImpl', () => {
        expect(faqServiceImpl).toBeTruthy();
    });

    it('should return fap details using GetFaqDetailsHandler', (done) => {
        // arrange
        const request: GetFaqRequest = {
            language: 'english',
            faqUrl: 'http://faq/url'
        };
        (GetFaqDetailsHandler as jest.Mock<GetFaqDetailsHandler>).mockImplementation(() => {
            return {
                handle: jest.fn().mockImplementation(() => of({}))
            } as Partial<GetFaqDetailsHandler> as GetFaqDetailsHandler;
        });
        // act
        faqServiceImpl.getFaqDetails(request).subscribe(() => {
            // assert
            done();
        });
    });
});
