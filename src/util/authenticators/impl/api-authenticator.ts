import {ApiTokenHandler} from '../../../api/handlers/api-token-handler';
import {ApiConfig, ApiService, Request, Response, ResponseCode} from '../../../api';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../../preference-keys';
import {Authenticator} from '../../../api/def/authenticator';
import {DeviceInfo} from '../../device';
import {SharedPreferences} from '../../shared-preferences';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(
        private sharedPreferences: SharedPreferences,
        private apiConfig: ApiConfig,
        private deviceInfo: DeviceInfo,
        private apiService: ApiService
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
