import {ApiConfig, Connection, HttpRequestType, Request, Response} from '../index';
import {JWTokenType, JWTUtil} from '../util/jwt.util';
import {Observable, Subject} from 'rxjs';

export class ApiTokenHandler {

    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    public refreshAuthToken(connection: Connection): Observable<string> {

        const observable = new Subject<string>();

        connection.invoke(this.buildResetTokenAPIRequest(this.config)).subscribe((r: Response) => {
            try {
                const bearerToken = r.body.result.secret;
                observable.next(bearerToken);
                observable.complete();
            } catch (e) {
                observable.error(e);
            }
        });

        return observable;
    }

    private buildResetTokenAPIRequest(config: ApiConfig): Request {
        return new Request.Builder()
            .withPath(`/consumer/${config.api_authentication.mobileAppConsumer}/credential/register`)
            .withType(HttpRequestType.POST)
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
