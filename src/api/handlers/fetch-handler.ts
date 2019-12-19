import {HttpClientCordova} from '../impl/http-client-cordova';
import {BaseConnection} from '../impl/base-connection';
import {HttpClient, Request, Response} from '..';
import {Observable} from 'rxjs';
import {HttpClientBrowser} from '../impl/http-client-browser';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {Authenticator} from '../def/authenticator';
import {SdkConfig} from '../../sdk-config';

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

        switch (sdkConfig.platform) {
            case 'cordova': httpClient = new HttpClientCordova();
                break;
            case 'web': httpClient = new HttpClientBrowser();
                break;
            default: throw new Error('FATAL_ERROR: Invalid platform');
        }

        this.baseConnection = new BaseConnection(
            httpClient,
            this.sdkConfig.apiConfig,
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
