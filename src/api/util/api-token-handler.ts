import {ApiConfig, Connection, Request, REQUEST_TYPE, Response} from '..';
import {JWTokenType, JWTUtil} from './jwt.util';

export class ApiTokenHandler {

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
        return new Request.Builder()
            .withPath(`/consumer/${config.api_authentication.mobileAppConsumer}/credential/register`)
            .withType(REQUEST_TYPE.POST)
            .withHeaders({
                'Content-Encoding': 'gzip',
                'Authorization': `Bearer ${this.generateMobileDeviceConsumerBearerToken()}`
            })
            .build();
    }

    private generateMobileDeviceConsumerBearerToken(): string {
        const mobileAppConsumerKey = this.config.api_authentication.mobileAppKey;
        const mobileAppConsumerSecret = this.config.api_authentication.mobileAppSecret;
        const mobileDeviceConsumerKey = this.config.api_authentication.producerId + '-' +
            this.config.api_authentication.deviceId;

        const mobileDeviceConsumerSecret =
            JWTUtil.createJWToken(mobileAppConsumerKey, mobileAppConsumerSecret, JWTokenType.HS256);
        // noinspection UnnecessaryLocalVariableJS
        const mobileDeviceConsumerBearerToken =
            JWTUtil.createJWToken(mobileDeviceConsumerKey, mobileDeviceConsumerSecret, JWTokenType.HS256);

        return mobileDeviceConsumerBearerToken;
    }
}
