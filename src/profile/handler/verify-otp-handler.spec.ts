import { VerifyOtpHandler } from './verify-otp-handler';
import { ApiService } from '../..';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { mockSdkConfigWithSampleApiConfig } from '../../device-register/handler/device-register-handler.spec.data';
import { SdkConfig } from '../../sdk-config';
import { mockProfileServiceConfig } from './accept-term-condition-handler.spec.data';
import { ProfileServiceConfig } from '../config/profile-service-config';


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
      mockApiService.fetch = jest.fn(() => { });
      (mockApiService.fetch as jest.Mock).mockReturnValue(of({
          body: {
              result: {
              }
          }
      }
      ));

      const request =  {
        'key': 'SOME_KEY',
        'type': 'SOME_TYPE',
        'otp': 'SOME_OTP'
    };

       // act
       verifyOTPHandler.handle(request).subscribe(() => {
        // assert
        expect(mockApiService.fetch).toHaveBeenCalled();
        done();
    });
    });

});
