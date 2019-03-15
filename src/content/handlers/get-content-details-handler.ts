import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {
    Content,
    ContentData,
    ContentDecorateRequest,
    ContentDetailRequest,
    ContentEventType,
    ContentFeedback,
    ContentFeedbackService,
    ContentMarker,
    ContentServiceConfig
} from '..';
import {Observable} from 'rxjs';
import {DbService, ReadQuery} from '../../db';
import {ContentEntry} from '../db/schema';
import {QueryBuilder} from '../../db/util/query-builder';
import {ContentMapper} from '../util/content-mapper';
import {ContentAccess, Profile, ProfileService} from '../../profile';
import {ContentMarkerHandler} from './content-marker-handler';
import {ContentUtil} from '../util/content-util';
import {EventNamespace, EventsBusService} from '../../events-bus';

export class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly GET_CONTENT_DETAILS_ENDPOINT = '/read';

    constructor(private contentFeedbackService: ContentFeedbackService,
                private profileService: ProfileService,
                private apiService: ApiService,
                private contentServiceConfig: ContentServiceConfig,
                private dbService: DbService,
                private eventsBusService: EventsBusService) {
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

    public handle(request: ContentDetailRequest): Observable<Content> {
        return this.fetchFromDB(request.contentId)
            .mergeMap((contentDbEntry) => {
                if (contentDbEntry) {
                    return Observable.of(ContentMapper.mapContentDBEntryToContent(contentDbEntry))
                        .do(async (localContent) => {
                            const serverContentData: ContentData = await this.fetchFromServer(request).toPromise();
                            contentDbEntry[ContentEntry.COLUMN_NAME_SERVER_DATA] = JSON.stringify(serverContentData);
                            contentDbEntry[ContentEntry.COLUMN_NAME_SERVER_LAST_UPDATED_ON] = serverContentData['lastUpdatedOn'];
                            contentDbEntry[ContentEntry.COLUMN_NAME_AUDIENCE] = ContentUtil.readAudience(serverContentData);
                            await this.dbService.update({
                                table: ContentEntry.TABLE_NAME,
                                selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} =?`,
                                selectionArgs: [contentDbEntry[ContentEntry.COLUMN_NAME_IDENTIFIER]],
                                modelJson: contentDbEntry
                            }).toPromise();
                            if (ContentUtil.isUpdateAvailable(serverContentData, localContent.contentData)) {
                                this.eventsBusService.emit({
                                    namespace: EventNamespace.CONTENT,
                                    event: {
                                        type: ContentEventType.UPDATE,
                                        payload: {
                                            contentId: localContent.contentData.identifier
                                        }
                                    }
                                });
                            }
                        });
                }

                return this.fetchAndDecorate(request);
            });
    }

    /** @internal */
    public fetchFromDB(contentId: string): Observable<ContentEntry.SchemaMap | undefined> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
            selectionArgs: [contentId],
            limit: '1'
        }).map((contentsFromDB: ContentEntry.SchemaMap[]) => contentsFromDB[0]);
    }

    fetchFromServer(request: ContentDetailRequest): Observable<ContentData> {
        return this.apiService.fetch<{ result: { content: ContentData } }>(
            new Request.Builder()
                .withType(HttpRequestType.GET)
                .withPath(this.contentServiceConfig.apiPath + this.GET_CONTENT_DETAILS_ENDPOINT + '/' + request.contentId)
                .withApiToken(true)
                .build()
        ).map((response) => {
            return response.body.result.content;
        });
    }


    fetchAndDecorate(request: ContentDetailRequest): Observable<Content> {
        return this.fetchFromServer(request).map((contentData: ContentData) => {
            return ContentMapper.mapServerResponseToContent(contentData);
        }).mergeMap((content: Content) => {
            return this.decorateContent({
                content,
                attachFeedback: request.attachFeedback,
                attachContentAccess: request.attachContentAccess,
                attachContentMarker: request.attachContentMarker
            });
        });
    }

    /** @internal */
    public decorateContent(request: ContentDecorateRequest): Observable<Content> {
        return Observable.of(request.content)
            .mergeMap(async (content) => {
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

