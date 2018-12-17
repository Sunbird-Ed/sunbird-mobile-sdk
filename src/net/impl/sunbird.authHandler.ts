import {APIAuthHandler} from '../def/api.authHandler';
import {APIConfig} from '../config/api.config';
import {Injectable} from '@angular/core';
import {JWTokenType, JWTUtil} from '../util/jwt.util';
import {APIConnection, APIRequest, APIResponse, REQUEST_TYPE} from '..';

@Injectable()
export class SunbirdAuthHandler implements APIAuthHandler {

    constructor(private config: APIConfig, private connection: APIConnection) {
    }

    resetAuthToken(): Promise<string> {
        return this.connection.invoke(this.buildResetTokenAPIRequest()).then((r: APIResponse) => {
            try {
                const bearerToken = r.response().result.secret;
                return Promise.resolve(bearerToken);
            } catch (e) {
                return Promise.reject(e);
            }
        });
    }

    private buildResetTokenAPIRequest(): APIRequest {
        return new APIRequest(
            `${this.config.baseUrl}/consumer/${this.config.mobileAppConsumer}/credential/register`,
            REQUEST_TYPE.POST,
            {
                'Content-Encoding': 'gzip',
                'Authorization': `Bearer ${this.generateMobileDeviceConsumerBearerToken()}`
            }
        )
    }

    private generateMobileDeviceConsumerBearerToken(): string {
        const mobileAppConsumerKey = this.config.mobileAppKey;
        const mobileAppConsumerSecret = this.config.mobileAppSecret;
        const mobileDeviceConsumerKey = this.config.producerId + '-' + this.config.deviceId;

        const mobileDeviceConsumerSecret = JWTUtil.createJWToken(mobileAppConsumerKey, mobileAppConsumerSecret, JWTokenType.HS256);
        const mobileDeviceConsumerBearerToken = JWTUtil.createJWToken(mobileDeviceConsumerKey, mobileDeviceConsumerSecret, JWTokenType.HS256);

        return mobileDeviceConsumerBearerToken;
    }
}