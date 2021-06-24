import {GetContentDetailsHandler} from './get-content-details-handler';
import {
    ApiService, Content,
    ContentDecorateRequest,
    ContentDetailRequest,
    ContentFeedbackService,
    ContentServiceConfig,
    DbService,
    EventsBusService,
    ProfileService
} from '../..';
import {of} from 'rxjs';
import {ContentMapper} from '../util/content-mapper';
import {mockContentData} from './get-content-details-handler.spec.data';


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

    it ('should fetch data from server if objectType is QuestionSet', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
            return of({
                body: {
                    result: {
                        questionset: {}
                    }
                }
            });
        });
        // act
        getContentDetailsHandler.fetchFromServer({
            contentId: 'sample_content_id',
            objectType: 'QuestionSet'
        });
        // assert
        setTimeout(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        }, 0);
    });

    it ('should fetch data from server if objectType is question', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
            return of({
                body: {
                    result: {
                        questionset: {}
                    }
                }
            });
        });
        // act
        getContentDetailsHandler.fetchFromServer({
            contentId: 'sample_content_id',
            objectType: 'Question'
        });
        // assert
        setTimeout(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        }, 0);
    });


    it('should handle undefined content', async (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([{content_type: 'course', local_data: '{"contentType":"course"}'}]));
        mockApiService.fetch = jest.fn().mockImplementation(() => of({
            body: {
                result: 'sample_result'
            }
        }));
        spyOn(getContentDetailsHandler, 'fetchFromServer').and.returnValue(of([]));
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
            contentData: data,
        };
        const req_data = {
            content: content
        };
        mockApiService.fetch = jest.fn().mockImplementation(() => of({
            body: {
                result: {
                    content: 'SAMPLE_CONTENT'
                }
            }
        }));
        spyOn(getContentDetailsHandler, 'fetchFromDB').and.returnValue(of([]));
        ContentMapper.mapContentDBEntryToContent = jest.fn().mockImplementation(() => {
        });
        (ContentMapper.mapContentDBEntryToContent as jest.Mock).mockReturnValue((req_data.content));
        JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
            return req_data.content;
        });
        mockDbService.update = jest.fn().mockImplementation(() => of(undefined));
        getContentDetailsHandler.handle(request).subscribe((res) => {
            // assert
            expect(ContentMapper.mapContentDBEntryToContent).toHaveBeenCalled();
            expect(res).toBe(content);
            done();
        });
    });

    it('should be fetch all content from DB', (done) => {
        // arrange
        const contentIds = 'SAMPLE_CONTENT_ID';
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        // act
        getContentDetailsHandler.fetchFromDBForAll(contentIds).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });

    it('should attached feedback and marker in content', (done) => {
        // arrange
        const content_data: Content = {
            identifier: 'SAMPLE_IDENTIFIER',
            name: '',
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
        mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => {
        });
        (mockProfileService.getActiveProfileSession as jest.Mock).mockReturnValue(of([]));
        mockContentFeedbackService.getFeedback = jest.fn().mockImplementation(() => {
        });
        (mockContentFeedbackService.getFeedback as jest.Mock).mockReturnValue(of([]));
        mockProfileService.getAllContentAccess = jest.fn().mockImplementation(() => {
        });
        (mockProfileService.getAllContentAccess as jest.Mock).mockReturnValue(of([]));
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        // act
        getContentDetailsHandler.decorateContent(request).subscribe(() => {
            // assert
            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
            expect(mockContentFeedbackService.getFeedback).toHaveBeenCalled();
            expect(mockProfileService.getAllContentAccess).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });
});
