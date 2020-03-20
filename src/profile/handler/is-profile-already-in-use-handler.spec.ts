import {IsProfileAlreadyInUseHandler} from './is-profile-already-in-use-handler';
import {ApiService, ProfileServiceConfig} from '../..';
import {of} from 'rxjs';
import {mockProfileServiceConfig} from './accept-term-condition-handler.spec.data';

describe('GenerateOTPHandler', () => {
    let isProfileAlreadyInUseHandler: IsProfileAlreadyInUseHandler;

    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        isProfileAlreadyInUseHandler = new IsProfileAlreadyInUseHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GenerateOTPHandler', () => {
        expect(isProfileAlreadyInUseHandler).toBeTruthy();
    });


    it('should get the data from GenerateOTPHandler', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {
                        ProfileExistsResponse: {}
                    }
                }
            }
        ));

        const request = {
            'key': 'SOME_KEY',
            'type': 'SOME_TYPE'
        };

        // act
        isProfileAlreadyInUseHandler.handle(request).subscribe((response) => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

});
