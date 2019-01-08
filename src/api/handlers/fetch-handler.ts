import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {ApiConfig, Connection, Request, Response} from '..';
import {ApiAuthenticator} from '../impl/api-authenticator';
import {Observable} from 'rxjs';

export class FetchHandler {
    private baseConnection: Connection;

    constructor(private request: Request,
                private apiConfig: ApiConfig) {
        const httpClient = new HttpClientImpl();
        this.baseConnection = new BaseConnection(httpClient, this.apiConfig!);
    }

    public doFetch(): Observable<Response> {
        this.handleBearerToken();
        return this.baseConnection.invoke(this.request);
    }

    private handleBearerToken() {
        if (this.request.requiredApiToken !== true) {
            return;
        }

        this.request.authenticators.push(new ApiAuthenticator(this.apiConfig!));
    }

}
