import {GetUserFeedHandler} from './get-userfeed-handler';
import {ApiService} from '../..';
import {of} from 'rxjs';
import {mockSdkConfigWithSampleApiConfig} from '../../device-register/handler/device-register-handler.spec.data';
import {SdkConfig} from '../../sdk-config';


describe('GetUserFeedHandler', () => {
    let getUserFeedHandler: GetUserFeedHandler;

    const mockApiService: Partial<ApiService> = {};
    // const mockProfileServiceConfig: Partial<SdkConfig> = {};

    beforeAll(() => {
        getUserFeedHandler = new GetUserFeedHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockApiService as ApiService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of getUserFeedHandler', () => {
        expect(getUserFeedHandler).toBeTruthy();
    });


    it('should get the data from getUserFeedHandler', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {
                        response: {
                            UserFeed: {}
                        }
                    }
                }
            }
        ));

        // act
        getUserFeedHandler.handle('12334').subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

});
