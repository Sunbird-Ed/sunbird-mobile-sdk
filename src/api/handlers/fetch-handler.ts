import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {ApiConfig, HttpClient, Request, Response} from '..';
import {Observable} from 'rxjs';
import {HttpClientAxios} from '../impl/http-client-axios';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {Authenticator} from '../def/authenticator';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';
import {SharedPreferencesLocalStorage} from '../../util/shared-preferences/impl/shared-preferences-local-storage';
import {SharedPreferencesAndroid} from '../../util/shared-preferences/impl/shared-preferences-android';

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
            case 'cordova': httpClient = new HttpClientImpl();
                break;
            case 'web': httpClient = new HttpClientAxios();
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
