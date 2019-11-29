import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UserMigrateRequest} from '../def/user-migrate-request';
import {UserMigrateResponse} from '../def/user-migrate-response';
import {Observable} from 'rxjs';
import {SdkConfig} from '../../sdk-config';

export class UserMigrateVerificationHandler implements ApiRequestHandler<UserMigrateRequest, UserMigrateResponse> {

    private static readonly USER_MIGRATE = '/user/v1/migrate';

    private readonly apiConfig: ApiConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private apiService: ApiService
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(request: UserMigrateRequest): Observable<UserMigrateResponse> {
        return this.fetchFromServer(request);
    }

    fetchFromServer(request): Observable<UserMigrateResponse> {
        const apiRequest: Request = new Request.Builder()
                .withHost(this.apiConfig.host)
                .withType(HttpRequestType.POST)
                .withPath( UserMigrateVerificationHandler.USER_MIGRATE)
                .withApiToken(true)
                .withBody(request)
                .build();


        return this.apiService.fetch<{ result: { response: UserMigrateResponse } }>(apiRequest)
            .map((success) => {
                return success.body.result.response;
            });
    }

}