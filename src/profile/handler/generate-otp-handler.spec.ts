import { GenerateOtpHandler } from './generate-otp-handler';
import { ApiService } from '../..';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { mockSdkConfigWithSampleApiConfig } from '../../device-register/handler/device-register-handler.spec.data';
import { SdkConfig } from '../../sdk-config';
import { mockProfileServiceConfig } from './accept-term-condition-handler.spec.data';
import { ProfileServiceConfig } from '../config/profile-service-config';


describe('GenerateOTPHandler', () => {
    let generateOTPHandler: GenerateOtpHandler;

    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        generateOTPHandler = new GenerateOtpHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GenerateOTPHandler', () => {
        expect(generateOTPHandler).toBeTruthy();
    });


    it('should get the data from GenerateOTPHandler', (done) => {
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
        'type': 'SOME_TYPE'
    };

       // act
       generateOTPHandler.handle(request).subscribe(() => {
        // assert
        expect(mockApiService.fetch).toHaveBeenCalled();
        done();
    });
    });

});
