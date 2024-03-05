import {ApiConfig, ApiService, ResponseCode} from '..';
import {from, Observable} from 'rxjs';
import * as dayjs from 'dayjs';
import {DeviceInfo} from '../../util/device';
import {CsHttpRequestType, CsNetworkError, CsRequest} from '@project-sunbird/client-services/core/http-service';
import { JwtUtil } from '../../util/jwt-util';

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

  private async buildGetMobileDeviceConsumerSecretAPIRequest(path: string): Promise<CsRequest> {
    return new CsRequest.Builder()
      .withPath(path)
      .withType(CsHttpRequestType.POST)
      .withHeaders({
        'Content-Encoding': 'gzip',
        'Authorization': `Bearer ${await this.generateMobileAppConsumerBearerToken()}`
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
    const apiPathKongV2 = `/api/api-manager/v2/consumer/${this.config.api_authentication.mobileAppConsumer}/credential/register`;
    let req = await this.buildGetMobileDeviceConsumerSecretAPIRequest(apiPathKongV2);
    return this.apiService.fetch(req).toPromise()
      .then((res) => {
        return res.body.result.token;
      }).catch((e) => {
        if ((!(CsNetworkError.isInstance(e)))) {
          const apiPathKongV1 = `/api/api-manager/v1/consumer/${this.config.api_authentication.mobileAppConsumer}/credential/register`;
          if (e.response.responseCode === ResponseCode.HTTP_KONG_FAILURE) {
            const responseHeaders = e.response.headers;
            const fallBackUrl = responseHeaders ? responseHeaders['location'] : apiPathKongV1;
            return this.getBearerTokenFromFallback(fallBackUrl || apiPathKongV1);
          } else {
            return this.getBearerTokenFromFallback(apiPathKongV1);
          }
        }
        throw  e;
      });
  }

  private async getBearerTokenFromFallback(fallBackUrl: string): Promise<string> {
    let req = await this.buildGetMobileDeviceConsumerSecretAPIRequest(fallBackUrl);
    return this.apiService.fetch(req).toPromise()
      .then(async (res) => {
        const result = res.body.result;
        if (!result.token) {
          return await JwtUtil.createJWTToken(this.getMobileDeviceConsumerKey(), result.secret)
        }
        return result.token;
      }).catch((e) => {
        console.log('e ', e);
      });
  }

  private async generateMobileAppConsumerBearerToken(): Promise<string> {
    const mobileAppConsumerKey = this.config.api_authentication.mobileAppKey;
    const mobileAppConsumerSecret = this.config.api_authentication.mobileAppSecret;
    return await JwtUtil.createJWTToken(mobileAppConsumerKey, mobileAppConsumerSecret)
  }
}
