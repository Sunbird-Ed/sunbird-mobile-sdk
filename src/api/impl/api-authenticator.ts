import {ApiTokenHandler} from '../handlers/api-token-handler';
import {ApiConfig, Request, Response, ResponseCode} from '..';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../app-config';
import {Authenticator} from '../def/authenticator';
import {Connection} from '../def/connection';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(private apiConfig: ApiConfig, private connection: Connection) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig, this.connection);
    }

    interceptRequest(request: Request): Request {
        const bearerToken = localStorage.getItem(ApiKeys.KEY_API_TOKEN);

        if (bearerToken) {
            const existingHeaders = request.headers;
            existingHeaders['Authorization'] = `Bearer ${bearerToken}`;
            request.headers = existingHeaders;
        }

        return request;
    }

    interceptResponse(request: Request, response: Response): Observable<Response> {
        if (response.responseCode === ResponseCode.HTTP_UNAUTHORISED &&
            response.body.message === 'Unauthorized') {
            return this.apiTokenHandler.refreshAuthToken()
                .do((bearerToken) => localStorage.setItem(ApiKeys.KEY_API_TOKEN, bearerToken))
                .mergeMap(() => this.connection.invoke(request));
        }

        return Observable.of(response);
    }
}
