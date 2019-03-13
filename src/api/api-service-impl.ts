import {ApiConfig} from './config/api-config';
import {Request} from './def/request';
import {Response} from './def/response';
import {FetchHandler} from './handlers/fetch-handler';
import {Observable} from 'rxjs';
import {ApiService} from './def/api-service';
import {DeviceInfo} from '../util/device/def/device-info';
import {SharedPreferences} from '../util/shared-preferences';

export class ApiServiceImpl implements ApiService {

    constructor(private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo,
                private sharedPreferences: SharedPreferences) {
    }

    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    public fetch<T = any>(request: Request): Observable<Response<T>> {
        return new FetchHandler(request, this.apiConfig, this.deviceInfo, this.sharedPreferences).doFetch();
    }
}
