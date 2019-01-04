import {ApiConfig} from './config/api-config';
import {Request} from './def/request';
import {Response} from './def/response';
import {FetchHandler} from './util/fetch-handler';
import {Observable} from 'rxjs';

export class ApiService {

    private static readonly _instance?: ApiService;
    private apiConfig?: ApiConfig;

    public static get instance(): ApiService {
        if (!ApiService._instance) {
            return new ApiService();
        }

        return ApiService._instance;
    }

    /**
     * Instantiate SDK
     * @param apiConfig - provide configuration
     */
    public init(apiConfig: ApiConfig) {
        this.apiConfig = apiConfig;
    }

    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    public fetch(request: Request): Observable<Response> {
        return new FetchHandler(request, this.apiConfig!).doFetch();
    }
}
