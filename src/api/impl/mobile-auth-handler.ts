import {ApiConfig, Connection, Request, REQUEST_TYPE, Response} from '..';
import {JWTokenType, JWTUtil} from '../util/jwt.util';

export class MobileAuthHandler {

    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    public resetAuthToken(connection: Connection): Promise<string> {
        return connection.invoke(this.buildResetTokenAPIRequest(this.config)).then((r: Response) => {
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