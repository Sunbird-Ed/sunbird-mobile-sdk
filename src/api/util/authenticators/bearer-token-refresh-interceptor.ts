import {ApiTokenHandler} from '../../handlers/api-token-handler';
import {ApiConfig, ApiService} from '../..';
import {Observable, of} from 'rxjs';
import {ApiKeys} from '../../../preference-keys';
import {DeviceInfo} from '../../../util/device';
import {SharedPreferences} from '../../../util/shared-preferences';
import {mergeMap, tap} from 'rxjs/operators';
import {
    CsHttpResponseCode,
    CsRequest,
    CsResponse,
    CsResponseInterceptor
} from '@project-sunbird/client-services/core/http-service';

export class BearerTokenRefreshInterceptor implements CsResponseInterceptor {
    private apiTokenHandler: ApiTokenHandler;

    constructor(
        private sharedPreferences: SharedPreferences,
        private apiConfig: ApiConfig,
        private deviceInfo: DeviceInfo,
        private apiService: ApiService
    ) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig, this.apiService, this.deviceInfo);
    }

    interceptResponse(request: CsRequest, response: CsResponse): Observable<CsResponse> {
        if ((response.responseCode === CsHttpResponseCode.HTTP_UNAUTHORISED && response.body.message === 'Unauthorized')
            || response.responseCode === CsHttpResponseCode.HTTP_FORBIDDEN) {
            return this.apiTokenHandler.refreshAuthToken()
                .pipe(
                    tap(async (bearerToken) => {
                        await this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken).toPromise();
                    }),
                    mergeMap(() => this.apiService.fetch(request))
                );
        }

        return of(response);
    }
}
