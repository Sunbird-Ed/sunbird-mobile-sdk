import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Content, ContentData, ContentDetailRequest, ContentServiceConfig} from '..';
import {Observable} from 'rxjs';
import {DbService, ReadQuery} from '../../db';
import {ContentEntry} from '../db/schema';
import {QueryBuilder} from '../../db/util/query-builder';
import {ContentMapper} from '../util/content-mapper';

export class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly GET_CONTENT_DETAILS_ENDPOINT = '/api/read/';

    constructor(private dbService: DbService,
                private contentServiceConfig?: ContentServiceConfig,
                private apiService?: ApiService) {
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
        return this.readContentFromDB(request.contentId)
            .mergeMap((rows: ContentEntry.SchemaMap[] | undefined) => {
                if (rows && rows[0]) {
                    return Observable.of(ContentMapper.mapContentDBEntryToContent(rows[0]));
                }

                return this.fetchFromServer(request)
                    .map((contentData: ContentData) => {
                        return ContentMapper.mapContentDBEntryToContent(ContentMapper.mapContentDataToContentDBEntry(contentData));
                    });
            });
    }

    private readContentFromDB(contentId: string): Observable<ContentEntry.SchemaMap[]> {
        return this.dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: new QueryBuilder()
                .where('? = ?')
                .args([ContentEntry.COLUMN_NAME_IDENTIFIER, contentId])
                .end()
                .build(),
            limit: '1'
        });
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

    private fetchFromServer(request: ContentDetailRequest): Observable<ContentData> {
        return this.apiService!.fetch<{ result: ContentData }>(new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.contentServiceConfig!.apiPath + this.GET_CONTENT_DETAILS_ENDPOINT + request.contentId)
            .withApiToken(true)
            .withSessionToken(true)
            .build())
            .map((response) => {
                return response.body.result;
            });
    }
}
