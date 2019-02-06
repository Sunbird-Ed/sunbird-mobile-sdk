import {Authenticator} from '../def/authenticator';
import {ApiTokenHandler} from '../handlers/api-token-handler';
import {ApiConfig, Connection, Request, Response, ResponseCode} from '..';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../app-config';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(private apiConfig: ApiConfig) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig);
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

    onResponse(request: Request, response: Response, connection: Connection): Observable<Response> {
        if (response.responseCode === ResponseCode.HTTP_UNAUTHORISED &&
            response.body.message === 'Unauthorized') {
            return this.apiTokenHandler.refreshAuthToken(connection)
                .do((bearerToken) => localStorage.setItem(ApiKeys.KEY_API_TOKEN, bearerToken))
                .mergeMap(() => connection.invoke(request));
        }

        return Observable.of(response);
    }
}
