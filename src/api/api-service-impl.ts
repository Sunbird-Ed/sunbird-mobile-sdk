import {ApiConfig} from './config/api-config';
import {Request} from './def/request';
import {Response} from './def/response';
import {FetchHandler} from './handlers/fetch-handler';
import {Observable} from 'rxjs';
import {ApiService} from './def/api-service';
import {DeviceInfo} from '../util/device';
import {SharedPreferences} from '../util/shared-preferences';
import {Authenticator} from './def/authenticator';

export class ApiServiceImpl implements ApiService {

    private defaultApiAuthenticators: Authenticator[];
    private defaultSessionAuthenticators: Authenticator[];

    constructor(private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo,
                private sharedPreferences: SharedPreferences) {
    }

    public fetch<T = any>(request: Request): Observable<Response<T>> {
        return new FetchHandler(
            request,
            this.apiConfig,
            this.deviceInfo,
            this.sharedPreferences,
            this.defaultApiAuthenticators,
            this.defaultSessionAuthenticators
        ).doFetch();
    }

    setDefaultApiAuthenticators(authenticators: Authenticator[]): void {
        this.defaultApiAuthenticators = authenticators;
    }

    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void {
        this.defaultSessionAuthenticators = authenticators;
    }
}
