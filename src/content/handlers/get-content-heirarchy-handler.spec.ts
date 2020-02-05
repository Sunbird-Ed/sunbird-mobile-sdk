import { GetContentHeirarchyHandler } from './get-content-heirarchy-handler';
import { ApiService } from '../..';
import { ContentServiceConfig, ContentDetailRequest } from '..';
import { of } from 'rxjs';

describe('GetContentHeirarchyHandler', () => {
    let getContentHeirarchyHandler: GetContentHeirarchyHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockContentServiceConfig: Partial<ContentServiceConfig> = {};

    beforeAll(() => {
        getContentHeirarchyHandler = new GetContentHeirarchyHandler(
            mockApiService as ApiService,
            mockContentServiceConfig as ContentServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of getContentHeirarchyHandler', () => {
        expect(getContentHeirarchyHandler).toBeTruthy();
    });

    it('shpuld handle mapContentFromContentHeirarchyData by invoked handle()', (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'do_123'
        };
        mockApiService.fetch = jest.fn().mockImplementation(() => of({
            body: {
                result: {
                    content: {
                        children: ['child-1', 'child-2']
                    }
                }
            }
        }));
        // act
        getContentHeirarchyHandler.handle(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });
});
