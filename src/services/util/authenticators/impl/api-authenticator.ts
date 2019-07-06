import {ApiTokenHandler} from '../../../../native/http/handlers/api-token-handler';
import {HttpConfig, HttpService, Request, Response, ResponseCode} from '../../../../native/http';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../../../preference-keys';
import {Authenticator} from '../../../../native/http/def/authenticator';
import {DeviceInfo} from '../../../../native/device';
import {SharedPreferences} from '../../../../native/shared-preferences';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(
        private sharedPreferences: SharedPreferences,
        private apiConfig: HttpConfig,
        private deviceInfo: DeviceInfo,
        private apiService: HttpService
    ) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig, this.apiService, this.deviceInfo);
    }

    interceptRequest(request: Request): Observable<Request> {
        return this.sharedPreferences.getString(ApiKeys.KEY_API_TOKEN)
            .map((bearerToken) => {
                if (bearerToken) {
                    const existingHeaders = request.headers;
                    existingHeaders['Authorization'] = `Bearer ${bearerToken}`;
                    request.headers = existingHeaders;
                }

                return request;
            });
    }

    interceptResponse(request: Request, response: Response): Observable<Response> {
        if ((response.responseCode === ResponseCode.HTTP_UNAUTHORISED && response.body.message === 'Unauthorized')
            || response.responseCode === ResponseCode.HTTP_FORBIDDEN) {
            return this.apiTokenHandler.refreshAuthToken()
                .do(async (bearerToken) => {
                    await this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken).toPromise();
                })
                .mergeMap(() => this.apiService.fetch(request));
        }

        return Observable.of(response);
    }
}
