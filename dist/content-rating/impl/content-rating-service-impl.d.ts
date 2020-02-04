import { GetContentRatingOptionsRequest } from '../def/get-content-rating-request';
import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { SdkConfig } from '../../sdk-config';
import { ContentRatingService } from '../def/content-rating-service';
import { ContentRatingOptions } from '../def/content-rating';
export declare class ContentRatingServiceImpl implements ContentRatingService {
    private sdkConfig;
    private fileService;
    private apiService;
    private cachedItemStore;
    constructor(sdkConfig: SdkConfig, fileService: FileService, apiService: ApiService, cachedItemStore: CachedItemStore);
    getContentRatingOptions(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions>;
}
