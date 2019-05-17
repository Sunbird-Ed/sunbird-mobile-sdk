import {ApiConfig, ApiService, Request, RequestInterceptor, Response, ResponseCode, ResponseInterceptor} from '../../../api';
import {Observable} from 'rxjs';
import {AuthKeys} from '../../../preference-keys';
import {AuthService, OAuthSession} from '../../../auth';
import {SharedPreferences} from '../../shared-preferences';

export class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {


    constructor(
        private sharedPreferences: SharedPreferences,
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private authService: AuthService
    ) {
    }

    interceptRequest(request: Request): Observable<Request> {
        return this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION)
            .map((stringifiedSessionData?: string) => {
                if (stringifiedSessionData) {
                    const sessionData: OAuthSession = JSON.parse(stringifiedSessionData);

                    const existingHeaders = request.headers;
                    existingHeaders['X-Authenticated-User-Token'] = sessionData.access_token;

                    request.headers = existingHeaders;
                } else {
                    throw new Error('No Session Found');
                }

                return request;
            });
    }

    interceptResponse(request: Request, response: Response): Observable<Response> {
        if (response.responseCode !== ResponseCode.HTTP_UNAUTHORISED) {
            return Observable.of(response);
        }

        if (response.body.message) {
            return Observable.of(response);
        }

        return this.invokeRefreshSessionTokenApi()
            .mergeMap(() => this.apiService.fetch(request));
    }

    private invokeRefreshSessionTokenApi() {
        return this.authService.refreshSession();
    }
}
