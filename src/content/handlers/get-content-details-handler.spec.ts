import { GetContentDetailsHandler } from './get-content-details-handler';
import {
    ContentFeedbackService, ProfileService, ApiService, ContentServiceConfig, DbService,
    EventsBusService, ContentDetailRequest, ContentData, ContentDecorateRequest
} from '../..';
import { Observable } from 'rxjs';
import { ContentMapper } from '../util/content-mapper';
import { Content, OriginData } from '../def/content';
import { mockContentData } from './get-content-details-handler.spec.data';


describe('GetContentDetailsHandler', () => {
    let getContentDetailsHandler: GetContentDetailsHandler;

    const mockContentFeedbackService: Partial<ContentFeedbackService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockContentServiceConfig: Partial<ContentServiceConfig> = {};
    const mockDbService: Partial<DbService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};

    beforeAll(() => {
        getContentDetailsHandler = new GetContentDetailsHandler(
            mockContentFeedbackService as ContentFeedbackService,
            mockProfileService as ProfileService,
            mockApiService as ApiService,
            mockContentServiceConfig as ContentServiceConfig,
            mockDbService as DbService,
            mockEventsBusService as EventsBusService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of getContentDetailsHandler', () => {
        expect(getContentDetailsHandler).toBeTruthy();
    });

    it('should handle undefind content', async (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        mockDbService.read = jest.fn(() => Observable.of([]));
        mockApiService.fetch = jest.fn(() => []);
        spyOn(getContentDetailsHandler, 'fetchFromServer').and.returnValue(Observable.of([]));
        getContentDetailsHandler.handle(request).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });

    it('should handle available content into Db', (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        const orgData = 'sample';
        const data = {
            originData: orgData
        };

        const content = {
            contentData: data
        };
        const req_data = {
            content: content
        };
        console.log('data', typeof (content.contentData.originData));
        spyOn(getContentDetailsHandler, 'fetchFromDB').and.returnValue(Observable.of([]));
        ContentMapper.mapContentDBEntryToContent = jest.fn(() => { });
        (ContentMapper.mapContentDBEntryToContent as jest.Mock).mockReturnValue((req_data.content));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return req_data.content;
        });
        getContentDetailsHandler.handle(request).subscribe(() => {
            // assert
            // expect(mockDbService.read).toHaveBeenCalled();
            // expect(ContentMapper.mapContentDBEntryToContent).toHaveBeenCalled();
            done();
        });
    });

    it('should be fetch all content from DB', () => {
        // arrange
        const contentIds = 'SAMPLE_CONTENT_ID';
        mockDbService.read = jest.fn(() => Observable.of([]));
        // act
        getContentDetailsHandler.fetchFromDBForAll(contentIds).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
        });
    });

    it('should attached feedback and marker in content', () => {
        // arrange
        const content_data: Content = {
            identifier: 'SAMPLE_IDENTIFIER',
            contentData: mockContentData,
            mimeType: '',
            basePath: '',
            contentType: '',
            referenceCount: 1,
            lastUpdatedTime: 1,
            isAvailableLocally: true,
            isUpdateAvailable: true,
            sizeOnDevice: 1,
            lastUsedTime: 1
        };
        const request: ContentDecorateRequest = {
            content: content_data,
            attachFeedback: true,
            attachContentAccess: true,
            attachContentMarker: true
        };
        mockProfileService.getActiveProfileSession = jest.fn(() => { });
        (mockProfileService.getActiveProfileSession as jest.Mock).mockReturnValue(Observable.of([]));
        mockContentFeedbackService.getFeedback = jest.fn(() => { });
        (mockContentFeedbackService.getFeedback as jest.Mock).mockReturnValue(Observable.of([]));
        mockProfileService.getAllContentAccess = jest.fn(() => { });
        (mockProfileService.getAllContentAccess as jest.Mock).mockReturnValue(Observable.of([]));
        mockDbService.execute = jest.fn(() => Observable.of([]));
        // act
        getContentDetailsHandler.decorateContent(request).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
        });
    });
});
