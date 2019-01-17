import {ApiConfig} from './config/api-config';
import {Request} from './def/request';
import {Response} from './def/response';
import {FetchHandler} from './handlers/fetch-handler';
import {Observable} from 'rxjs';
import {ApiService} from './def/api-service';

export class ApiServiceImpl implements ApiService {

    private apiConfig: ApiConfig;

    constructor(apiConfig: ApiConfig) {
        this.apiConfig = apiConfig;
    }

    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    public fetch<T = any>(request: Request): Observable<Response<T>> {
        return new FetchHandler(request, this.apiConfig!).doFetch();
    }
}
