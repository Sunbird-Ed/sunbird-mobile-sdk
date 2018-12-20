import {ApiConfig} from '..';
import {JWTokenType, JWTUtil} from '../util/jwt.util';
import {Connection, Request, REQUEST_TYPE, Response} from '..';

export class MobileAuthHandler {

    public resetAuthToken(config: ApiConfig, connection: Connection): Promise<string> {
        return connection.invoke(this.buildResetTokenAPIRequest(config)).then((r: Response) => {
            try {
                const bearerToken = r.response().result.secret;
                return Promise.resolve(bearerToken);
            } catch (e) {
                return Promise.reject(e);
            }
        });
    }

    private buildResetTokenAPIRequest(config: ApiConfig): Request {
        return new Request(
            `/consumer/${config.mobileAppConsumer}/credential/register`,
            REQUEST_TYPE.POST,
            {
                'Content-Encoding': 'gzip',
                'Authorization': `Bearer ${this.generateMobileDeviceConsumerBearerToken(config)}`
            }
        )
    }

    private generateMobileDeviceConsumerBearerToken(config: ApiConfig): string {
        const mobileAppConsumerKey = config.mobileAppKey;
        const mobileAppConsumerSecret = config.mobileAppSecret;
        const mobileDeviceConsumerKey = config.producerId + '-' + config.deviceId;

        const mobileDeviceConsumerSecret = JWTUtil.createJWToken(mobileAppConsumerKey, mobileAppConsumerSecret, JWTokenType.HS256);
        const mobileDeviceConsumerBearerToken = JWTUtil.createJWToken(mobileDeviceConsumerKey, mobileDeviceConsumerSecret, JWTokenType.HS256);

        return mobileDeviceConsumerBearerToken;
    }
}