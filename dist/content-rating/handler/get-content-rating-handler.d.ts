import { GetContentRatingOptionsRequest } from '../def/get-content-rating-request';
import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api';
import { Observable } from 'rxjs';
import { ContentRatingServiceConfig } from '..';
import { ContentRatingOptions } from '../def/content-rating';
export declare class GetContentRatingOptionsHandler {
    private apiService;
    private contentRatingServiceConfig;
    private fileservice;
    private cachedItemStore;
    private readonly CONTENT_RATING_FILE_KEY_PREFIX;
    private readonly CONTENT_RATING_LOCAL_KEY;
    constructor(apiService: ApiService, contentRatingServiceConfig: ContentRatingServiceConfig, fileservice: FileService, cachedItemStore: CachedItemStore);
    handle(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions>;
    private fetchFromServer;
    private fetchFromFile;
}
