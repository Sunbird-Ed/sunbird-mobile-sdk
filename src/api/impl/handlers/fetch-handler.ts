import {HttpClientImpl} from '../http-client-impl';
import {BaseConnection} from '../base-connection';
import {ApiConfig, Connection, KEY_API_TOKEN, KEY_USER_TOKEN, Request, Response} from '../..';
import {BearerInterceptor} from '../interceptors/bearer-interceptor';
import {SessionInterceptor} from '../interceptors/session-interceptor';
import {FetchConfig} from '../../config/fetch-config';

export class FetchHandler {
    private baseConnection: Connection;

    constructor(private request: Request,
                private apiConfig: ApiConfig,
                private fetchConfig: FetchConfig) {
        let httpClient = new HttpClientImpl();
        this.baseConnection = new BaseConnection(httpClient, this.apiConfig!);
    }

    public async doFetch(): Promise<Response> {
        this.handleBearerToken();
        this.handleSessionToken();
        this.handleCustomInterceptors();

        return await this.baseConnection.invoke(this.request);
    }

    private handleBearerToken() {
        if (this.fetchConfig!!.requiredApiToken !== true) {
            return;
        }

        let bearerToken = localStorage.getItem(KEY_API_TOKEN);

        if (bearerToken) {
            let existingHeaders = this.request.headers;
            existingHeaders["Authorization"] = "Bearer " + bearerToken;
            this.request.headers = existingHeaders;
        }

        this.baseConnection.addResponseInterceptor(new BearerInterceptor(this.apiConfig!));
    };

    private handleSessionToken() {
        if (this.fetchConfig!!.requiredSessionToken !== true) {
            return;
        }

        let sessionToken = localStorage.getItem(KEY_USER_TOKEN);

        if (sessionToken) {
            let existingHeaders = this.request.headers;
            existingHeaders["X-Authenticated-User-Token"] = sessionToken;
            this.request.headers = existingHeaders;
        }

        this.baseConnection.addResponseInterceptor(new SessionInterceptor());
    };

    private handleCustomInterceptors() {
        if (this.fetchConfig!!.responseInterceptors!!.length > 0) {
            for (let interceptor of this.fetchConfig!!.responseInterceptors!!) {
                this.baseConnection.addResponseInterceptor(interceptor);
            }
        }
    };
}