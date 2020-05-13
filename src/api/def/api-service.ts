import {Observable} from 'rxjs';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {
    CsRequest,
    CsRequestInterceptor,
    CsResponse,
    CsResponseInterceptor
} from '@project-sunbird/client-services/core/http-service';

export interface ApiService extends SdkServiceOnInitDelegate {
    fetch<T = any>(request: CsRequest): Observable<CsResponse<T>>;

    setDefaultRequestInterceptors(interceptors: CsRequestInterceptor[]);

    setDefaultResponseInterceptors(interceptors: CsResponseInterceptor[]);
}
