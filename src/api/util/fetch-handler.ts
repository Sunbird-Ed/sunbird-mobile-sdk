import {HttpClientImpl} from '../impl/http-client-impl';
import {BaseConnection} from '../impl/base-connection';
import {ApiConfig, Connection, Request, Response} from '..';
import {ApiAuthenticator} from "../impl/api-authenticator";

export class FetchHandler {
    private baseConnection: Connection;

    constructor(private request: Request,
                private apiConfig: ApiConfig) {
        let httpClient = new HttpClientImpl();
        this.baseConnection = new BaseConnection(httpClient, this.apiConfig!);
    }

    public async doFetch(): Promise<Response> {
        this.handleBearerToken();
        return await this.baseConnection.invoke(this.request);
    }

    private handleBearerToken() {
        if (this.request.requiredApiToken !== true) {
            return;
        }

        this.request.authenticators.push(new ApiAuthenticator(this.apiConfig!))

    }

}