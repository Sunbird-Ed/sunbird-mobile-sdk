import {ApiConfig} from './config/api-config';
import {Request} from './def/request';
import {Response} from './def/response';
import {FetchHandler} from './handlers/fetch-handler';
import {Observable, throwError, of} from 'rxjs';
import {ApiService} from './def/api-service';
import {DeviceInfo} from '../util/device';
import {SharedPreferences} from '../util/shared-preferences';
import {Authenticator} from './def/authenticator';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../injection-tokens';
import {SdkConfig} from '../sdk-config';
import {ApiKeys} from '../preference-keys';
import {ApiTokenHandler} from './handlers/api-token-handler';
import {ErrorEventType, EventNamespace, EventsBusEvent, EventsBusService, HttpClientErrorEvent, HttpServerErrorEvent} from '../events-bus';
import {HttpServerError} from './errors/http-server-error';
import {EmitRequest} from '../events-bus/def/emit-request';
import {HttpClientError} from './errors/http-client-error';
import {catchError, mergeMap} from 'rxjs/operators';

@injectable()
export class ApiServiceImpl implements ApiService {

    private defaultApiAuthenticators: Authenticator[];
    private defaultSessionAuthenticators: Authenticator[];
    private apiConfig: ApiConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    onInit(): Observable<undefined> {
        return this.sharedPreferences.getString(ApiKeys.KEY_API_TOKEN).pipe(
            mergeMap((apiToken) => {
                if (!apiToken) {
                    return new ApiTokenHandler(this.apiConfig, this, this.deviceInfo).refreshAuthToken().pipe(
                        mergeMap((bearerToken) =>
                            this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken)
                        ),
                        catchError(() => of(undefined))
                    );
                }

                return of(undefined);
            }));
    }

    public fetch<T = any>(request: Request): Observable<Response<T>> {
        return new FetchHandler(
            request,
            this.apiConfig,
            this.deviceInfo,
            this.sharedPreferences,
            this.defaultApiAuthenticators,
            this.defaultSessionAuthenticators
        ).doFetch().pipe(
            catchError((e) => {
                if (e instanceof HttpServerError) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.ERROR,
                        event: {
                            type: ErrorEventType.HTTP_SERVER_ERROR,
                            payload: e
                        } as HttpServerErrorEvent
                    } as EmitRequest<EventsBusEvent>);
                } else if (e instanceof HttpClientError) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.ERROR,
                        event: {
                            type: ErrorEventType.HTTP_CLIENT_ERROR,
                            payload: e
                        } as HttpClientErrorEvent
                    } as EmitRequest<EventsBusEvent>);
                }

                return throwError(e);
            }));
    }

    setDefaultApiAuthenticators(authenticators: Authenticator[]): void {
        this.defaultApiAuthenticators = authenticators;
    }

    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void {
        this.defaultSessionAuthenticators = authenticators;
    }
}
