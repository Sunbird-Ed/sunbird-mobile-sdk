import {GetContentRatingOptionsRequest} from '../def/get-content-rating-request';
import {CachedItemStore} from '../../key-value-store';
import {GetContentRatingOptionsHandler} from '../handler/get-content-rating-handler';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';
import {SdkConfig} from '../../sdk-config';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {ContentRatingService} from '../def/content-rating-service';
import { ContentRatingOptions } from '../def/content-rating';

@injectable()
export class ContentRatingServiceImpl implements ContentRatingService {

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
                @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
                @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore) {
    }

    getContentRatingOptions(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions> {
        return new GetContentRatingOptionsHandler(
            this.apiService,
            this.sdkConfig.contentRatingServiceConfig,
            this.fileService,
            this.cachedItemStore,
        ).handle(request);
    }

}
