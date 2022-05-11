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
    ContentServiceConfig,
    MimeType,
    Visibility
} from '..';
import {Observable, of} from 'rxjs';
import {DbService, ReadQuery} from '../../db';
import {ContentEntry} from '../db/schema';
import {QueryBuilder} from '../../db/util/query-builder';
import {ContentMapper} from '../util/content-mapper';
import {ContentAccess, ProfileService, ProfileSession} from '../../profile';
import {ContentMarkerHandler} from './content-marker-handler';
import {ContentUtil} from '../util/content-util';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {map, mergeMap, tap} from 'rxjs/operators';
import COLUMN_NAME_MIME_TYPE = ContentEntry.COLUMN_NAME_MIME_TYPE;
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;

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

    public static isUnit(contentDbEntry: ContentEntry.SchemaMap) {
        return contentDbEntry[COLUMN_NAME_MIME_TYPE] === MimeType.COLLECTION
            && contentDbEntry[COLUMN_NAME_VISIBILITY] === Visibility.PARENT;
    }

    public handle(request: ContentDetailRequest): Observable<Content> {
        request.emitUpdateIfAny = request.emitUpdateIfAny === undefined ? true : request.emitUpdateIfAny;

        return this.fetchFromDB(request.contentId).pipe(
            mergeMap((contentDbEntry: ContentEntry.SchemaMap | undefined) => {
                if (!contentDbEntry) {
                    return this.fetchAndDecorate(request);
                }

                return of(ContentMapper.mapContentDBEntryToContent(contentDbEntry)).pipe(
                    mergeMap((content: Content) => {
                        if (typeof (content.contentData.originData) === 'string') {
                            content.contentData.originData = ContentUtil.getParseErrorObject(content.contentData.originData);
                        }
                        if (content.contentData.trackable && typeof (content.contentData.trackable) === 'string') {
                            content.contentData.trackable = JSON.parse(content.contentData.trackable);
                        }
                        return this.decorateContent({
                            content,
                            attachFeedback: request.attachFeedback,
                            attachContentAccess: request.attachContentAccess,
                            attachContentMarker: request.attachContentMarker
                        });
                    }),
                    tap(async (localContent) => {
                        if (!request.emitUpdateIfAny || GetContentDetailsHandler.isUnit(contentDbEntry)) {
                            return;
                        }

                        let sendStreamUrlEvent = false;
                        const serverDataInDb: ContentData = contentDbEntry[ContentEntry.COLUMN_NAME_SERVER_DATA] &&
                            JSON.parse(contentDbEntry[ContentEntry.COLUMN_NAME_SERVER_DATA]);

                        if (!serverDataInDb) {
                            sendStreamUrlEvent = true;
                        } else if (!serverDataInDb.streamingUrl) {
                            sendStreamUrlEvent = true;
                        }

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
                                        contentId: localContent.contentData.identifier,
                                        size: serverContentData.size
                                    }
                                }
                            });
                        }

                        if (serverContentData) {
                            this.eventsBusService.emit({
                                namespace: EventNamespace.CONTENT,
                                event: {
                                    type: ContentEventType.SERVER_CONTENT_DATA,
                                    payload: {
                                        contentId: serverContentData.identifier,
                                        streamingUrl: serverContentData.streamingUrl,
                                        licenseDetails: serverContentData.licenseDetails,
                                        size: serverContentData.size,
                                        serverContentData: serverContentData,
                                    }
                                }
                            });
                        }
                    })
                );
            })
        );
    }

    /** @internal */
    public fetchFromDB(contentId: string): Observable<ContentEntry.SchemaMap | undefined> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
            selectionArgs: [contentId],
            limit: '1'
        }).pipe(
            map((contentsFromDB: ContentEntry.SchemaMap[]) => contentsFromDB[0])
        );
    }

    public fetchFromDBForAll(contentIds: string): Observable<ContentEntry.SchemaMap[]> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} IN (${contentIds})`
        });
    }

    fetchFromServer(request: ContentDetailRequest): Observable<ContentData> {
        switch (request.objectType) {
            case 'QuestionSet':
                return this.apiService.fetch<{ result: { questionset: ContentData } }>(
                    new Request.Builder()
                        .withHost(this.contentServiceConfig.host)
                        .withType(HttpRequestType.GET)
                        .withPath(this.contentServiceConfig.questionSetReadApiPath +
                            this.GET_CONTENT_DETAILS_ENDPOINT + '/' + request.contentId)
                        .withBearerToken(false)
                        .build()
                ).pipe(
                    map((response) => {
                        return response.body.result.questionset;
                    })
                );
            case 'Question':
                return this.apiService.fetch<{ result: { question: ContentData } }>(
                    new Request.Builder()
                        .withHost(this.contentServiceConfig.host)
                        .withType(HttpRequestType.GET)
                        .withPath(this.contentServiceConfig.questionReadApiPath +
                            this.GET_CONTENT_DETAILS_ENDPOINT + '/' + request.contentId)
                        .withBearerToken(false)
                        .build()
                ).pipe(
                    map((response) => {
                        return response.body.result.question;
                    })
                );
            default:
                return this.apiService.fetch<{ result: { content: ContentData } }>(
                    new Request.Builder()
                        .withHost(this.contentServiceConfig.host)
                        .withType(HttpRequestType.GET)
                        .withPath(this.contentServiceConfig.apiPath + this.GET_CONTENT_DETAILS_ENDPOINT + '/' + request.contentId)
                        .withParameters({
                            licenseDetails: 'name,url,description'
                        })
                        .withBearerToken(true)
                        .build()
                ).pipe(
                    map((response) => {
                        return response.body.result.content;
                    })
                );
        }
    }

    fetchAndDecorate(request: ContentDetailRequest): Observable<Content> {
        return this.fetchFromServer(request).pipe(
            map((contentData: ContentData) => {
                return ContentMapper.mapServerResponseToContent(contentData);
            }),
            mergeMap((content: Content) => {
                return this.decorateContent({
                    content,
                    attachFeedback: request.attachFeedback,
                    attachContentAccess: request.attachContentAccess,
                    attachContentMarker: request.attachContentMarker
                });
            })
        );
    }

    /** @internal */
    public decorateContent(request: ContentDecorateRequest): Observable<Content> {
        return of(request.content).pipe(
            mergeMap((content) => {
                if (request.attachContentAccess) {
                    return this.attachContentAccess(content);
                }

                return of(content);
            }),
            mergeMap((content) => {
                if (request.attachFeedback) {
                    return this.attachFeedback(content);
                }

                return of(content);
            }),
            mergeMap((content) => {
                if (request.attachContentMarker) {
                    return this.attachContentMarker(content);
                }

                return of(content);
            })
        );
    }

    private attachContentAccess(content: Content): Observable<Content> {
        return this.profileService.getActiveProfileSession().pipe(
            mergeMap(({uid}: ProfileSession) => {
                return this.profileService.getAllContentAccess({
                    contentId: content.identifier,
                    uid
                }).pipe(
                    map((contentAccess: ContentAccess[]) => {
                        return {
                            ...content,
                            contentAccess
                        };
                    })
                );
            })
        );
    }

    private attachFeedback(content: Content): Observable<Content> {
        return this.profileService.getActiveProfileSession().pipe(
            mergeMap(({uid}: ProfileSession) => {
                return this.contentFeedbackService.getFeedback({
                    contentId: content.identifier,
                    uid
                }).pipe(
                    map((contentFeedback: ContentFeedback[]) => {
                        return {
                            ...content,
                            contentFeedback
                        };
                    })
                );
            })
        );
    }

    private attachContentMarker(content: Content): Observable<Content> {
        return this.profileService.getActiveProfileSession().pipe(
            mergeMap(({uid}: ProfileSession) => {
                return new ContentMarkerHandler(this.dbService).getContentMarker(content.identifier, uid).pipe(
                    map((contentMarkers: ContentMarker[]) => {
                        return {
                            ...content,
                            contentMarkers
                        };
                    })
                );
            })
        );
    }
}
