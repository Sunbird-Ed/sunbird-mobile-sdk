import {ApiService} from '../..';
import {Observable, of} from 'rxjs';
import {AuthService} from '../../../auth';
import {mergeMap} from 'rxjs/operators';
import {
    CsHttpResponseCode,
    CsRequest,
    CsResponse,
    CsResponseInterceptor
} from '@project-sunbird/client-services/core/http-service';

export class UserTokenRefreshInterceptor implements CsResponseInterceptor {
    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) {
    }

    interceptResponse(request: CsRequest, response: CsResponse): Observable<CsResponse> {
        if (response.responseCode !== CsHttpResponseCode.HTTP_UNAUTHORISED) {
            return of(response);
        }

        if (response.body.message) {
            return of(response);
        }

        return this.invokeRefreshSessionTokenApi()
            .pipe(
                mergeMap(() => this.apiService.fetch(request))
            );
    }

    private invokeRefreshSessionTokenApi() {
        return this.authService.refreshSession();
    }
}
