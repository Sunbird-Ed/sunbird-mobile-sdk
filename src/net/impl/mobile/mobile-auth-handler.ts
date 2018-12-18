import {AuthHandler} from '../../def/auth-handler';
import {APIConfig} from '../../config/api.config';
import {Injectable} from '@angular/core';
import {JWTokenType, JWTUtil} from '../../util/jwt.util';
import {Connection, Request, REQUEST_TYPE, Response} from '../../index';

@Injectable()
export class MobileAuthHandler implements AuthHandler {

    constructor(private config: APIConfig, private connection: Connection) {
    }

    public resetAuthToken(): Promise<string> {
        return this.connection.invoke(this.buildResetTokenAPIRequest()).then((r: Response) => {
            try {
                const bearerToken = r.response().result.secret;
                return Promise.resolve(bearerToken);
            } catch (e) {
                return Promise.reject(e);
            }
        });
    }

    private buildResetTokenAPIRequest(): Request {
        return new Request(
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