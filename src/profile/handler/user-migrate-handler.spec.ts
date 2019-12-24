import { UserFeed } from './../def/user-feed-response';
import { UserMigrateHandler } from './user-migrate-handler';
import { ApiService } from '../..';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { mockSdkConfigWithSampleApiConfig } from '../../device-register/handler/device-register-handler.spec.data';
import { SdkConfig } from '../../sdk-config';
import { mockProfileServiceConfig } from './accept-term-condition-handler.spec.data';
import {UserMigrateRequest} from './../def/user-migrate-request';

describe('GetUserFeedHandler', () => {
    let userMigrateHandler: UserMigrateHandler;

    const mockApiService: Partial<ApiService> = {};
    // const mockProfileServiceConfig: Partial<SdkConfig> = {};

    beforeAll(() => {
        userMigrateHandler = new UserMigrateHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockApiService as ApiService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of userMigrateHandler', () => {
        expect(UserMigrateHandler).toBeTruthy();
    });


    it('should get the data from UserMigrateHandler', (done) => {
      // arrange
      mockApiService.fetch = jest.fn(() => { });
      (mockApiService.fetch as jest.Mock).mockReturnValue(of({
          body: {
              UserFeed: {

              }
          }
      }
      ));
       const req: UserMigrateRequest = {
        'userId' : 'sample_id',
        'action' : 'reject'
       };
       // act
       userMigrateHandler.handle(req).subscribe(() => {
        // assert
        expect(mockApiService.fetch).toHaveBeenCalled();
        done();
    });
    });

});
