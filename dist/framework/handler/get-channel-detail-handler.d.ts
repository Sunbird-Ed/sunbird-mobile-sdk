import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { Channel, ChannelDetailsRequest, FrameworkServiceConfig } from '..';
import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
export declare class GetChannelDetailsHandler implements ApiRequestHandler<ChannelDetailsRequest, Channel> {
    private apiService;
    private frameworkServiceConfig;
    private fileService;
    private cachedItemStore;
    private readonly CHANNEL_FILE_KEY_PREFIX;
    private readonly CHANNEL_LOCAL_KEY;
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT;
    constructor(apiService: ApiService, frameworkServiceConfig: FrameworkServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore);
    handle(request: ChannelDetailsRequest): Observable<Channel>;
    private fetchFromServer;
    private fetchFromFile;
}
