import {HttpConfig, HttpService, Request, Response} from '@native/http';
import {FetchHandler} from '../handlers/fetch-handler';
import {Observable} from 'rxjs';
import {Authenticator} from '../def/authenticator';
import {inject, injectable} from 'inversify';
import {ApiTokenHandler} from '../handlers/api-token-handler';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../..';
import {DeviceInfo} from '../../device';
import {ApiKeys} from '../../../preference-keys';
import {SharedPreferences} from '../../shared-preferences';

@injectable()
export class HttpServiceImpl implements HttpService {

    private defaultApiAuthenticators: Authenticator[];
    private defaultSessionAuthenticators: Authenticator[];
    private apiConfig: HttpConfig;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences) {
        this.apiConfig = this.sdkConfig.httpConfig;
    }

    onInit(): Observable<undefined> {
        return this.sharedPreferences.getString(ApiKeys.KEY_API_TOKEN)
            .mergeMap((apiToken) => {
                if (!apiToken) {
                    return new ApiTokenHandler(this.apiConfig, this, this.deviceInfo).refreshAuthToken()
                        .mergeMap((bearerToken) =>
                            this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken)
                        )
                        .catch(() => Observable.of(undefined));
                }

                return Observable.of(undefined);
            });
    }

    public fetch<T = any>(request: Request): Observable<Response<T>> {
        return new FetchHandler(
            request,
            this.sdkConfig,
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
