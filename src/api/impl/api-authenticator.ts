import {ApiTokenHandler} from '../handlers/api-token-handler';
import {ApiConfig, Request, Response, ResponseCode} from '..';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../app-config';
import {Authenticator} from '../def/authenticator';
import {Connection} from '../def/connection';
import {DeviceInfo} from '../../util/device/def/device-info';
import {SharedPreferences} from '../../util/shared-preferences';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(private sharedPreferences: SharedPreferences, private apiConfig: ApiConfig, private deviceInfo: DeviceInfo, private connection: Connection) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig, this.connection, this.deviceInfo);
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
        if (response.responseCode === ResponseCode.HTTP_UNAUTHORISED &&
            response.body.message === 'Unauthorized') {
            return this.apiTokenHandler.refreshAuthToken()
                .do(async (bearerToken) => {
                    await this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken).toPromise();
                })
                .mergeMap(() => this.connection.invoke(request));
        }

        return Observable.of(response);
    }
}
