import { GetFaqDetailsHandler } from './get-faq-details-handler';
import { ApiService, CachedItemStore } from '../..';
import { FaqServiceConfig, GetFaqRequest } from '..';
import { FileService } from '../../util/file/def/file-service';
import { of } from 'rxjs';

describe('GetFaqDetailsHandler', () => {
    let getFaqDetailsHandler: GetFaqDetailsHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockFaqServiceConfig: Partial<FaqServiceConfig> = {};
    const mockFileservice: Partial<FileService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        getFaqDetailsHandler = new GetFaqDetailsHandler(
            mockApiService as ApiService,
            mockFaqServiceConfig as FaqServiceConfig,
            mockFileservice as FileService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of getFaqDetailsHandler', () => {
        expect(getFaqDetailsHandler).toBeTruthy();
    });

    it('should fetch data from server', (done) => {
        // arrange
        const request: GetFaqRequest = {
            language: 'english',
            faqUrl: 'http://faq/url'
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation((a, b, c, d, e) => d());
        const data = mockApiService.fetch =  jest.fn().mockImplementation(() => of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                },
                trim: jest.fn().mockImplementation(() => '{"name": "s-name"}')
            }
        }));

        // act
        getFaqDetailsHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch data from file', (done) => {
        // arrange
        window['device'] = { uuid: 'some_uuid', platform:'android' };
        const request: GetFaqRequest = {
            language: 'english',
            faqUrl: 'http://faq/url'
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation((a, b, c, d, e) => e());
        mockFileservice.readFileFromAssets = jest.fn().mockImplementation(() => Promise.resolve('{"uid": "sample-uid"}'));
        // act
        getFaqDetailsHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockFileservice.readFileFromAssets).toHaveBeenCalled();
            done();
        });
    });
});
