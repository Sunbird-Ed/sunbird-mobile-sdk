import { GetContentRatingOptionsRequest} from '../def/get-content-rating-request';
import {CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiService, HttpRequestType, Request} from '../../api';
import {from, Observable} from 'rxjs';
import {ContentRatingServiceConfig} from '..';
import {map} from 'rxjs/operators';
import { ContentRatingOptions } from '../def/content-rating';


export class GetContentRatingOptionsHandler {
    private readonly CONTENT_RATING_FILE_KEY_PREFIX = 'content-rating-';
    private readonly CONTENT_RATING_LOCAL_KEY = 'contentRating-';

    constructor(
        private apiService: ApiService,
        private contentRatingServiceConfig: ContentRatingServiceConfig,
        private fileservice: FileService,
        private cachedItemStore: CachedItemStore) {
    }

    handle(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions> {
        return this.cachedItemStore.getCached(
            request.language,
            this.CONTENT_RATING_LOCAL_KEY,
            'ttl_' + this.CONTENT_RATING_LOCAL_KEY,
             // enable once content rating options url available
            // () => this.fetchFromFile(request.language),
            () => this.fetchFromFile(request.language)
        );
    }

    private fetchFromServer(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withHost(request.ContentRatingUrl)
            .withPath('/content-rating-' + request.language + '.json')
            .withApiToken(false)
            .build();

        return this.apiService.fetch(apiRequest)
            .pipe(
                map((response) => {
                    const resp = JSON.parse(response.body.trim());
                    return resp;
                })
            );
    }

    private fetchFromFile(language: string): Observable<ContentRatingOptions> {
        const dir = Path.ASSETS_PATH + this.contentRatingServiceConfig.contentRatingConfigDirPath;
        const file = this.CONTENT_RATING_FILE_KEY_PREFIX + language + '.json';

        return from(this.fileservice.readFileFromAssets(dir.concat('/', file)))
            .pipe(
                map((filecontent: string) => {
                    const result = JSON.parse(filecontent);
                    return result;
                })
            );
    }

}
