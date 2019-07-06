import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {HttpClient, Request, Response} from '../index';
import {Observable} from 'rxjs';
import {HttpClientAxios} from '../impl/http-client-axios';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../device';
import {SharedPreferences} from '../../shared-preferences';
import {Authenticator} from '../def/authenticator';
import {Environments, SdkConfig} from '../../..';

export class FetchHandler {
    private baseConnection: Connection;

    constructor(
        private request: Request,
        private sdkConfig: SdkConfig,
        private deviceInfo: DeviceInfo,
        private sharedPreferences: SharedPreferences,
        private defaultApiAuthenticators: Authenticator[],
        private defaultSessionAuthenticators: Authenticator[]
    ) {
        let httpClient: HttpClient;

        if (sdkConfig.environment === Environments.ELECTRON) {
            httpClient = new HttpClientAxios();
        } else {
            httpClient = new HttpClientImpl();
        }

        this.baseConnection = new BaseConnection(
            httpClient,
            this.sdkConfig.httpConfig,
            this.deviceInfo,
            this.sharedPreferences,
            this.defaultApiAuthenticators,
            this.defaultSessionAuthenticators
        );
    }

    public doFetch(): Observable<Response> {
        return this.baseConnection.invoke(this.request);
    }
}
