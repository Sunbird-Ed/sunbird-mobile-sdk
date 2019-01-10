import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ContentDetailRequest} from '../def/requests';
import {Content, ContentData} from '../def/content';
import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {ContentMapper} from '../def/ContentMapper';
import {ContentServiceConfig} from '../config/content-config';
import {SessionAuthenticator} from '../../auth';

export class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly GET_CONTENT_DETAILS_ENDPOINT = 'read/';

    constructor(private dbService: DbService,
                private contentServiceConfig: ContentServiceConfig,
                private sessionAuthenticator: SessionAuthenticator,
                private apiService: ApiService) {
    }

    handle(request: ContentDetailRequest): Observable<Content> {
        return this.readContentFromDB(request.contentId)
            .mergeMap((rows: ContentEntry.SchemaMap[] | undefined) => {
                if (rows && rows[0]) {
                    return Observable.of(ContentMapper.mapContentDBEntryToContent(rows[0]));
                }

                return this.fetchFromServer(request)
                    .mergeMap((contentData: ContentData) => {
                        return this.insertContentIntoDB(ContentMapper.mapContentDataToContentDBEntry(contentData));
                    }).mergeMap(() => {
                        return this.handle(request);
                    });
            });
    }

    private readContentFromDB(contentId: string): Observable<ContentEntry.SchemaMap[]> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
            selectionArgs: [contentId],
            limit: 1
        });
    }

    private insertContentIntoDB(contentDBEntry: ContentEntry.SchemaMap): Observable<number> {
        return this.dbService.insert({
            table: ContentEntry.TABLE_NAME,
            modelJson: contentDBEntry
        });
    }

    private fetchFromServer(request: ContentDetailRequest): Observable<ContentData> {
        return this.apiService.fetch<{ result: ContentData }>(new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.contentServiceConfig.apiPath + this.GET_CONTENT_DETAILS_ENDPOINT + request.contentId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build())
            .map((response) => {
                return response.body.result;
            });
    }
}

