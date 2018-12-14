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
        // TODO: provide appropriate path
        return this.connection.invoke(new APIRequest('', REQUEST_TYPE.POST, {
            'Authorization': `Bearer ${this.generateMobileDeviceConsumerBearerToken()}`
        })).then((r: APIResponse) => {
            try {
                const bearerToken = r.response().result.secret;
                return Promise.resolve(bearerToken);
            } catch (e) {
                return Promise.reject(e);
            }
        });
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