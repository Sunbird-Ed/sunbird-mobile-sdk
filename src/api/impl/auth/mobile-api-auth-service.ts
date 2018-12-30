import {ApiConfig, Connection, Request, REQUEST_TYPE, Response} from '../../index';
import {JWTokenType, JWTUtil} from '../../util/jwt/jwt.util';
import {ApiAuthService} from '../../def/auth/api-auth-service';

export class MobileApiAuthService implements ApiAuthService {

    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    public refreshAuthToken(connection: Connection): Promise<string> {
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
            `/consumer/${config.api_authentication.mobileAppConsumer}/credential/register`,
            REQUEST_TYPE.POST,
            {
                'Content-Encoding': 'gzip',
                'Authorization': `Bearer ${this.generateMobileDeviceConsumerBearerToken()}`
            }
        )
    }

    private generateMobileDeviceConsumerBearerToken(): string {
        const mobileAppConsumerKey = this.config.api_authentication.mobileAppKey;
        const mobileAppConsumerSecret = this.config.api_authentication.mobileAppSecret;
        const mobileDeviceConsumerKey = this.config.api_authentication.producerId + '-' + this.config.api_authentication.deviceId;

        const mobileDeviceConsumerSecret = JWTUtil.createJWToken(mobileAppConsumerKey, mobileAppConsumerSecret, JWTokenType.HS256);
        const mobileDeviceConsumerBearerToken = JWTUtil.createJWToken(mobileDeviceConsumerKey, mobileDeviceConsumerSecret, JWTokenType.HS256);

        return mobileDeviceConsumerBearerToken;
    }
}