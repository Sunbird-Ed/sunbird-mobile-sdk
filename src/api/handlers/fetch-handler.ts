import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {ApiConfig, HttpClient, Request, Response} from '..';
import {Observable} from 'rxjs';
import {HttpClientAxios} from '../impl/http-client-axios';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../util/device/def/device-info';
import {SharedPreferences} from '../../util/shared-preferences';

export class FetchHandler {
    private baseConnection: Connection;

    constructor(private request: Request,
                private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo,
                private sharedPreferences: SharedPreferences) {
        let httpClient: HttpClient;

        if (apiConfig.debugMode) {
            httpClient = new HttpClientAxios();
        } else {
            httpClient = new HttpClientImpl();
        }

        this.baseConnection = new BaseConnection(httpClient, this.apiConfig, this.deviceInfo, this.sharedPreferences);
    }

    public doFetch(): Observable<Response> {
        return this.baseConnection.invoke(this.request);
    }
}
