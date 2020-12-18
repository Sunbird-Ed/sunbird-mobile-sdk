import {ApiConfig} from './config/api-config';
import {Observable, of, throwError} from 'rxjs';
import {ApiService} from './def/api-service';
import {DeviceInfo} from '../util/device';
import {SharedPreferences} from '../util/shared-preferences';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../injection-tokens';
import {SdkConfig} from '../sdk-config';
import {ApiKeys} from '../preference-keys';
import {ApiTokenHandler} from './handlers/api-token-handler';
import {ErrorEventType, EventNamespace, EventsBusEvent, EventsBusService, HttpClientErrorEvent, HttpServerErrorEvent} from '../events-bus';
import {EmitRequest} from '../events-bus/def/emit-request';
import {catchError, mergeMap} from 'rxjs/operators';
import {
    CsHttpClientError,
    CsHttpServerError,
    CsHttpService,
    CsRequest,
    CsRequestInterceptor,
    CsResponse,
    CsResponseInterceptor
} from '@project-sunbird/client-services/core/http-service';
import {BearerTokenRefreshInterceptor} from './util/authenticators/bearer-token-refresh-interceptor';
import {UserTokenRefreshInterceptor} from './util/authenticators/user-token-refresh-interceptor';
import {AuthService} from '../auth';
import {CsModule} from '@project-sunbird/client-services';
import {
    CsRequestLoggerInterceptor,
    CsResponseLoggerInterceptor
} from '@project-sunbird/client-services/core/http-service/utilities/interceptors';

@injectable()
export class ApiServiceImpl implements ApiService {
    private static PLANNED_MAINTENANCE_ERROR_CODE = 531;
    private hasEmittedPlannedMaintenanceErrorEvent = false;
    private defaultRequestInterceptors: CsRequestInterceptor[] = [];
    private defaultResponseInterceptors: CsResponseInterceptor[] = [];
    private apiConfig: ApiConfig;

    constructor(
        @inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
        @inject(CsInjectionTokens.HTTP_SERVICE) private httpService: CsHttpService
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;

        if (this.apiConfig.debugMode) {
            this.defaultRequestInterceptors = [
                new CsRequestLoggerInterceptor()
            ];

            this.defaultResponseInterceptors = [
                new CsResponseLoggerInterceptor()
            ];
        }
    }

    private _bearerTokenRefreshInterceptor?: BearerTokenRefreshInterceptor;

    get bearerTokenRefreshInterceptor(): BearerTokenRefreshInterceptor {
        if (!this._bearerTokenRefreshInterceptor) {
            this._bearerTokenRefreshInterceptor = new BearerTokenRefreshInterceptor(
                this.container.get<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES),
                this.container.get<SdkConfig>(InjectionTokens.SDK_CONFIG).apiConfig,
                this.container.get<DeviceInfo>(InjectionTokens.DEVICE_INFO),
                this.container.get<ApiService>(InjectionTokens.API_SERVICE)
            );
        }

        return this._bearerTokenRefreshInterceptor;
    }

    private _userTokenRefreshInterceptor?: UserTokenRefreshInterceptor;

    get userTokenRefreshInterceptor(): UserTokenRefreshInterceptor {
        if (!this._userTokenRefreshInterceptor) {
            this._userTokenRefreshInterceptor = new UserTokenRefreshInterceptor(
                this.container.get<ApiService>(InjectionTokens.API_SERVICE),
                this.container.get<AuthService>(InjectionTokens.AUTH_SERVICE)
            );
        }
        return this._userTokenRefreshInterceptor;
    }

    onInit(): Observable<undefined> {
        this.sharedPreferences.addListener(ApiKeys.KEY_API_TOKEN, (value) => {
            if (value) {
                CsModule.instance.config.core.api.authentication.bearerToken = value;
            } else {
                CsModule.instance.config.core.api.authentication.bearerToken = undefined;
            }

            CsModule.instance.updateConfig(CsModule.instance.config);
        });

        return this.sharedPreferences.getString(ApiKeys.KEY_API_TOKEN).pipe(
            mergeMap((apiToken) => {
                if (!apiToken) {
                    return new ApiTokenHandler(this.apiConfig, this, this.deviceInfo).refreshAuthToken().pipe(
                        mergeMap((bearerToken) => {
                            return this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken);
                        }),
                        catchError(() => of(undefined))
                    );
                }

                CsModule.instance.config.core.api.authentication.bearerToken = apiToken;
                CsModule.instance.updateConfig(CsModule.instance.config);
                return of(undefined);
            }));
    }

    public fetch<T = any>(request: CsRequest): Observable<CsResponse<T>> {
        this.defaultRequestInterceptors.forEach((i) => {
            if (request.requestInterceptors.indexOf(i) === -1) {
                request.requestInterceptors.push(i);
            }
        });

        this.defaultResponseInterceptors.forEach((i) => {
            if (request.responseInterceptors.indexOf(i) === -1) {
                request.responseInterceptors.push(i);
            }
        });

        if (request.withBearerToken) {
            const bearerTokenRefreshInterceptorIndex = request.responseInterceptors.indexOf(this.bearerTokenRefreshInterceptor);
            if (bearerTokenRefreshInterceptorIndex === -1) {
                request.responseInterceptors.push(this.bearerTokenRefreshInterceptor);
            } else {
                request.responseInterceptors.splice(bearerTokenRefreshInterceptorIndex, 1);
            }
        }

        if (request.withUserToken) {
            const userTokenRefreshInterceptorIndex = request.responseInterceptors.indexOf(this.userTokenRefreshInterceptor);
            if (userTokenRefreshInterceptorIndex === -1) {
                request.responseInterceptors.push(this.userTokenRefreshInterceptor);
            } else {
                request.responseInterceptors.splice(userTokenRefreshInterceptorIndex, 1);
            }
        }

        return this.httpService.fetch<T>(request).pipe(
            catchError((e) => {
                if (CsHttpServerError.isInstance(e)) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.ERROR,
                        event: {
                            type: ErrorEventType.HTTP_SERVER_ERROR,
                            payload: e
                        } as HttpServerErrorEvent
                    } as EmitRequest<EventsBusEvent>);

                    if ((e as CsHttpServerError).response.responseCode === ApiServiceImpl.PLANNED_MAINTENANCE_ERROR_CODE) {
                        if (!this.hasEmittedPlannedMaintenanceErrorEvent) {
                            this.hasEmittedPlannedMaintenanceErrorEvent = true;
                            this.eventsBusService.emit({
                                namespace: EventNamespace.ERROR,
                                event: {
                                    type: ErrorEventType.PLANNED_MAINTENANCE_PERIOD,
                                    payload: e
                                }
                            });
                        }
                    }
                } else if (CsHttpClientError.isInstance(e)) {
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

    setDefaultRequestInterceptors(interceptors: CsRequestInterceptor[]) {
        this.defaultRequestInterceptors = interceptors;

        if (this.apiConfig.debugMode) {
            this.defaultRequestInterceptors.push(
                new CsRequestLoggerInterceptor()
            );
        }
    }

    setDefaultResponseInterceptors(interceptors: CsResponseInterceptor[]) {
        this.defaultResponseInterceptors = interceptors;

        if (this.apiConfig.debugMode) {
            this.defaultResponseInterceptors.push(
                new CsResponseLoggerInterceptor()
            );
        }
    }
}
