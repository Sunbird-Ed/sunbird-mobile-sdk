import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {
    Content,
    ContentData,
    ContentDetailRequest,
    ContentFeedback,
    ContentFeedbackService, ContentMarker,
    ContentServiceConfig
} from '..';
import {Observable} from 'rxjs';
import {DbService, ReadQuery} from '../../db';
import {ContentEntry} from '../db/schema';
import {QueryBuilder} from '../../db/util/query-builder';
import {ContentMapper} from '../util/content-mapper';
import {CachedItemStore} from '../../key-value-store';
import {Profile, ProfileService} from '../../profile';
import {ContentAccess} from '../../profile/def/content-access';
import {ContentMarkerHandler} from './content-marker-handler';

export class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly CONTENT_LOCAL_KEY = 'content-';
    private readonly GET_CONTENT_DETAILS_ENDPOINT = '/read';

    constructor(private contentFeedbackService: ContentFeedbackService,
                private profileService: ProfileService,
                private apiService: ApiService,
                private contentServiceConfig: ContentServiceConfig,
                private cachedItemStore: CachedItemStore<Content>,
                private dbService: DbService) {
    }

    public static getReadContentQuery(identifier: string): ReadQuery {
        return {
            table: ContentEntry.TABLE_NAME,
            selection: new QueryBuilder()
                .where('? = ?')
                .args([ContentEntry.COLUMN_NAME_IDENTIFIER, identifier])
                .end()
                .build(),
            limit: '1'
        };
    }

    handle(request: ContentDetailRequest): Observable<Content> {
        return this.cachedItemStore.getCached(
            request.contentId,
            this.CONTENT_LOCAL_KEY,
            'ttl_' + this.CONTENT_LOCAL_KEY,
            () => this.fetchFromServer(request)
        );
    }

    getContentFromDB(contentId: string): Promise<ContentEntry.SchemaMap[]> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: new QueryBuilder()
                .where('? = ?')
                .args([ContentEntry.COLUMN_NAME_IDENTIFIER, contentId])
                .end()
                .build(),
            limit: '1'
        }).toPromise();
    }

    private fetchFromServer(request: ContentDetailRequest): Observable<Content> {
        return this.apiService.fetch<{ result: { content: ContentData } }>(new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.contentServiceConfig.apiPath + this.GET_CONTENT_DETAILS_ENDPOINT + '/' + request.contentId)
            .withApiToken(true)
            .build())
            .map((response) => {
                const contentData = response.body.result.content;
                return ContentMapper.mapServerResponseToContent(contentData);
            })
            .mergeMap(async (content: Content) => {
                if (request.attachContentAccess) {
                    content = await this.attachContentAccess(content).toPromise();
                }

                if (request.attachFeedback) {
                    content = await this.attachFeedback(content).toPromise();
                }

                if (request.attachContentMarker) {
                    content = await this.attachContentMarker(content).toPromise();
                }

                return content;
            });
    }

    private attachContentAccess(content: Content): Observable<Content> {
        return this.profileService.getActiveSessionProfile()
            .mergeMap(({uid}: Profile) => {
                return this.profileService.getAllContentAccess({
                    contentId: content.identifier,
                    uid
                }).map((contentAccess: ContentAccess[]) => {
                    return {
                        ...content,
                        contentAccess
                    };
                });
            });
    }

    private attachFeedback(content: Content): Observable<Content> {
        return this.profileService.getActiveSessionProfile()
            .mergeMap(({uid}: Profile) => {
                return this.contentFeedbackService.getFeedback({
                    contentId: content.identifier,
                    uid
                }).map((contentFeedback: ContentFeedback[]) => {
                    return {
                        ...content,
                        contentFeedback
                    };
                });
            });
    }

    private attachContentMarker(content: Content): Observable<Content> {
        return this.profileService.getActiveSessionProfile()
            .mergeMap(({uid}: Profile) => {
                return new ContentMarkerHandler(this.dbService).getContentMarker(content.identifier, uid)
                    .map
                    ((contentMarkers: ContentMarker[]) => {
                        return {
                            ...content,
                            contentMarkers
                        };
                    });
            });
    }
}

