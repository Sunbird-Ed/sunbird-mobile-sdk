import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {ApiConfig, HttpClient, Request, Response} from '../index';
import {Observable} from 'rxjs';
import {HttpClientAxios} from '../impl/http-client-axios';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../device';
import {SharedPreferences} from '../../shared-preferences';
import {Authenticator} from '../def/authenticator';

export class FetchHandler {
    private baseConnection: Connection;

    constructor(
        private request: Request,
        private apiConfig: ApiConfig,
        private deviceInfo: DeviceInfo,
        private sharedPreferences: SharedPreferences,
        private defaultApiAuthenticators: Authenticator[],
        private defaultSessionAuthenticators: Authenticator[]
    ) {
        let httpClient: HttpClient;

        if (apiConfig.debugMode) {
            httpClient = new HttpClientAxios();
        } else {
            httpClient = new HttpClientImpl();
        }

        this.baseConnection = new BaseConnection(
            httpClient,
            this.apiConfig,
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
