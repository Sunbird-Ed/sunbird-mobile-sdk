import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UserMigrateRequest} from '../def/user-migrate-request';
import {UserMigrateResponse} from '../def/user-migrate-response';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SdkConfig} from '../../sdk-config';
import {ProfileServiceConfig} from '../config/profile-service-config';

export class UserMigrateHandler implements ApiRequestHandler<UserMigrateRequest, UserMigrateResponse> {

    private static readonly USER_MIGRATE = '/migrate';

    private readonly apiConfig: ApiConfig;
    private readonly profileServiceConfig: ProfileServiceConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private apiService: ApiService
    ) {
        this.profileServiceConfig = this.sdkConfig.profileServiceConfig;
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(request: UserMigrateRequest): Observable<UserMigrateResponse> {
        return this.fetchFromServer(request);
    }

    fetchFromServer(request): Observable<UserMigrateResponse> {
        console.log('Request', request);
        const apiRequest: Request = new Request.Builder()
            .withHost(this.apiConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.profileApiPath_V5 + UserMigrateHandler.USER_MIGRATE)
            .withBearerToken(true)
            .withUserToken(true)
                .withBody({request: request})
                .build();


        // return this.apiService.fetch<{ result: { response: UserMigrateResponse } }>(apiRequest)
        return this.apiService.fetch(apiRequest).pipe(
            map((success) => {
                console.log('sucees', success);
                return success.body;
            })
        );
    }

}
