import {ApiConfig, ApiService, JWTokenType, JWTUtil} from '..';
import {from, Observable} from 'rxjs';
import * as dayjs from 'dayjs';
import {DeviceInfo} from '../../util/device';
import {map} from 'rxjs/operators';
import {
  CsHttpClientError,
  CsHttpRequestType,
  CsHttpServerError,
  CsNetworkError,
  CsRequest
} from '@project-sunbird/client-services/core/http-service';

export class ApiTokenHandler {

  private static readonly VERSION = '1.0';
  private static readonly ID = 'ekstep.genie.device.register';

  constructor(
    private config: ApiConfig,
    private apiService: ApiService,
    private deviceInfo: DeviceInfo
  ) {
  }

  public refreshAuthToken(): Observable<string> {
    return from(
      this.getBearerTokenFromKongV2()
    );
  }

  private getMobileDeviceConsumerKey() {
    return this.config.api_authentication.producerId + '-' + this.deviceInfo.getDeviceID();
  }

  private buildGetMobileDeviceConsumerSecretAPIRequest(path: string): CsRequest {
    return new CsRequest.Builder()
      .withPath(path)
      .withType(CsHttpRequestType.POST)
      .withHeaders({
        'Content-Encoding': 'gzip',
        'Authorization': `Bearer ${this.generateMobileAppConsumerBearerToken()}`
      })
      .withBody({
        id: ApiTokenHandler.ID,
        ver: ApiTokenHandler.VERSION,
        ts: dayjs().format(),
        request: {
          key: this.getMobileDeviceConsumerKey()
        }
      })
      .build();
  }

  private async getBearerTokenFromKongV2(): Promise<string> {
    console.log('APIV2', 'V2 called');
    const apiPathKongV2 = `/api/api-manager/v2/consumer/${this.config.api_authentication.mobileAppConsumer}/credential/register`;
    return this.apiService.fetch(this.buildGetMobileDeviceConsumerSecretAPIRequest(apiPathKongV2)).toPromise()
      .then((res) => {
        throw new Error();
        return res.body.result.token;
      }).catch((e) => {
        console.log('APIV2', 'V2 Filled');
        if (!(e instanceof CsNetworkError)) {
          return this.getBearerTokenFromKongV1();
        }
        throw  e;
      });
  }

  private async getBearerTokenFromKongV1(): Promise<string> {
    console.log('APIV1', 'V1 called');
    const apiPathKongV1 = `/api/api-manager/v1/consumer/${this.config.api_authentication.mobileAppConsumer}/credential/register`;
    return this.apiService.fetch(this.buildGetMobileDeviceConsumerSecretAPIRequest(apiPathKongV1)).toPromise()
      .then((res) => {
        const result = res.body.result;
        console.log('APIV2', result.token);
        if (!result.token) {
          return JWTUtil.createJWToken({iss: this.getMobileDeviceConsumerKey()}, result.secret, JWTokenType.HS256);
        }
        return result.token;
      }).catch(() => {

      });
  }

  private generateMobileAppConsumerBearerToken(): string {
    const mobileAppConsumerKey = this.config.api_authentication.mobileAppKey;
    const mobileAppConsumerSecret = this.config.api_authentication.mobileAppSecret;
    return JWTUtil.createJWToken({iss: mobileAppConsumerKey}, mobileAppConsumerSecret, JWTokenType.HS256);
  }
}
