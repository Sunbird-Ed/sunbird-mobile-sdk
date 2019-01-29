import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { Channel, ChannelDetailsRequest, FrameworkServiceConfig } from '..';
import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
import { SessionAuthenticator } from '../../auth';
export declare class GetChannelDetailsHandler implements ApiRequestHandler<ChannelDetailsRequest, Channel> {
    private apiService;
    private frameworkServiceConfig;
    private sessionAuthenticator;
    private fileservice;
    private cachedItemStore;
    private readonly GET_CHANNEL_DETAILS_ENDPOINT;
    private readonly DB_KEY_CHANNEL_DETAILS;
    private readonly CHANNEL_DETAILS_API_EXPIRATION_KEY;
    constructor(apiService: ApiService, frameworkServiceConfig: FrameworkServiceConfig, sessionAuthenticator: SessionAuthenticator, fileservice: FileService, cachedItemStore: CachedItemStore<Channel>);
    handle(request: ChannelDetailsRequest): Observable<Channel>;
    private fetchFromServer;
    private fetchFromFile;
}
