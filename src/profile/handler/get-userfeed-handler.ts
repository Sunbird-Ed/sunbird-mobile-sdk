import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UserFeedResponse} from '../def/user-feed-response';
import {Observable} from 'rxjs';
import {SdkConfig} from '../../sdk-config';

export class GetUserFeedHandler implements ApiRequestHandler<undefined, UserFeedResponse> {

    private static readonly GET_USER_FEED = '/user/v1/feed';

    private readonly apiConfig: ApiConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private apiService: ApiService
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(uid): Observable<UserFeedResponse> {
        return this.fetchFromServer(uid);
    }

    fetchFromServer(uid): Observable<UserFeedResponse> {
        return this.apiService.fetch<{ result: UserFeedResponse }>(
            new Request.Builder()
                .withHost(this.apiConfig.host)
                .withType(HttpRequestType.GET)
                .withPath( GetUserFeedHandler.GET_USER_FEED
                    + '/' + uid)
                .withApiToken(true)
                .build()
        ).map((response) => {
            return response.body.result;
        });
    }

}
