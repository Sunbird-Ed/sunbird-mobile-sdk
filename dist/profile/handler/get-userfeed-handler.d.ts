import { ApiRequestHandler, ApiService } from '../../api';
import { UserFeed } from '../def/user-feed-response';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
export declare class GetUserFeedHandler implements ApiRequestHandler<undefined, UserFeed[]> {
    private sdkConfig;
    private apiService;
    private static readonly GET_USER_FEED;
    private readonly apiConfig;
    private readonly profileServiceConfig;
    constructor(sdkConfig: SdkConfig, apiService: ApiService);
    handle(uid: any): Observable<UserFeed[]>;
    fetchFromServer(uid: any): Observable<UserFeed[]>;
}
