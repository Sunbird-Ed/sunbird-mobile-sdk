import {VerifyOtpHandler} from './verify-otp-handler';
import {ApiService, ProfileServiceConfig} from '../..';
import {of} from 'rxjs';
import {mockProfileServiceConfig} from './accept-term-condition-handler.spec.data';


describe('VerifyOtpHandler', () => {
    let verifyOTPHandler: VerifyOtpHandler;

    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        verifyOTPHandler = new VerifyOtpHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of VerifyOtpHandler', () => {
        expect(verifyOTPHandler).toBeTruthy();
    });


    it('should get the data from VerifyOtpHandler', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {}
                }
            }
        ));

        const request = {
            'key': 'SOME_KEY',
            'type': 'SOME_TYPE',
            'otp': 'SOME_OTP',
            'userId': 'SOME_USER_ID'
        };

        // act
        verifyOTPHandler.handle(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

});
