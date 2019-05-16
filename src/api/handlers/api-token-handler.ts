import {ApiConfig, ApiService, HttpRequestType, JWTokenType, JWTUtil, Request} from '..';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {DeviceInfo} from '../../util/device';

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
        return Observable.fromPromise(
            this.getMobileDeviceConsumerSecret()
        ).map((mobileDeviceConsumerSecret: string) => {
            return JWTUtil.createJWToken({iss: this.getMobileDeviceConsumerKey()}, mobileDeviceConsumerSecret, JWTokenType.HS256);
        });
    }

    private getMobileDeviceConsumerKey() {
        return this.config.api_authentication.producerId + '-' + this.deviceInfo.getDeviceID();
    }

    private buildGetMobileDeviceConsumerSecretAPIRequest(): Request {
        return new Request.Builder()
            .withPath(`/api/api-manager/v1/consumer/${this.config.api_authentication.mobileAppConsumer}/credential/register`)
            .withType(HttpRequestType.POST)
            .withHeaders({
                'Content-Encoding': 'gzip',
                'Authorization': `Bearer ${this.generateMobileAppConsumerBearerToken()}`
            })
            .withBody({
                id: ApiTokenHandler.ID,
                ver: ApiTokenHandler.VERSION,
                ts: moment().format(),
                request: {
                    key: this.getMobileDeviceConsumerKey()
                }
            })
            .build();
    }

    private async getMobileDeviceConsumerSecret(): Promise<string> {
        return this.apiService.fetch(this.buildGetMobileDeviceConsumerSecretAPIRequest()).toPromise()
            .then((res) => res.body.result.secret);
    }

    private generateMobileAppConsumerBearerToken(): string {
        const mobileAppConsumerKey = this.config.api_authentication.mobileAppKey;
        const mobileAppConsumerSecret = this.config.api_authentication.mobileAppSecret;

        return JWTUtil.createJWToken({iss: mobileAppConsumerKey}, mobileAppConsumerSecret, JWTokenType.HS256);
    }
}
