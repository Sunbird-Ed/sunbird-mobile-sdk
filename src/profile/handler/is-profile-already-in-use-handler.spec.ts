import { IsProfileAlreadyInUseHandler } from './is-profile-already-in-use-handler';
import { ApiService } from '../..';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { mockSdkConfigWithSampleApiConfig } from '../../device-register/handler/device-register-handler.spec.data';
import { SdkConfig } from '../../sdk-config';
import { mockProfileServiceConfig } from './accept-term-condition-handler.spec.data';
import { ProfileServiceConfig } from '../config/profile-service-config';
import {ProfileExistsResponse} from '../def/profile-exists-response';

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
      mockApiService.fetch = jest.fn(() => { });
      (mockApiService.fetch as jest.Mock).mockReturnValue(of({
          body: {
              result: {
                ProfileExistsResponse : {
                }
              }
          }
      }
      ));

      const request =  {
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
