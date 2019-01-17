import {Authenticator} from '../../api/def/authenticator';
import {ApiConfig, Connection, KEY_USER_TOKEN, Request, Response, ResponseCode, ResponseInterceptor} from '../../api';
import {AuthUtil} from './auth-util';
import {Observable, Observer} from 'rxjs';
import {ApiService} from '../../api/def/api-service';

export class SessionAuthenticator implements Authenticator, ResponseInterceptor {

    constructor(private apiConfig: ApiConfig,
                private apiService: ApiService) {
    }

    interceptRequest(request: Request): Request {
        const sessionToken = localStorage.getItem(KEY_USER_TOKEN);

        if (sessionToken) {
            const existingHeaders = request.headers;
            existingHeaders['X-Authenticated-User-Token'] = sessionToken;
            request.headers = existingHeaders;
        }

        return request;
    }

    onResponse(request: Request, response: Response, connection: Connection): Observable<Response> {
        return Observable.create(async (observer: Observer<Response>) => {
            if (response.responseCode !== ResponseCode.HTTP_UNAUTHORISED) {
                observer.next(response);
            }

            if (response.body().message) {
                observer.next(response);
            }

            observer.next(await this.refreshToken(request, connection));
            observer.complete();
        });
    }

    private async refreshToken(request, connection): Promise<Response> {
        const authUtil = new AuthUtil(this.apiService);
        const sessionData = await authUtil.refreshSession(connection, this.apiConfig.user_authentication.authUrl);
        await authUtil.startSession(sessionData);

        return connection.invoke(request);
    }
}
