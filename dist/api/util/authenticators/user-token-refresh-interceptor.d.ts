import { ApiService } from '../..';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth';
import { CsRequest, CsResponse, CsResponseInterceptor } from '@project-sunbird/client-services/core/http-service';
export declare class UserTokenRefreshInterceptor implements CsResponseInterceptor {
    private apiService;
    private authService;
    constructor(apiService: ApiService, authService: AuthService);
    interceptResponse(request: CsRequest, response: CsResponse): Observable<CsResponse>;
    private invokeRefreshSessionTokenApi;
}
