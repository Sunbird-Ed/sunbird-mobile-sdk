import { ApiRequestHandler, ApiService } from '../../api';
import { Content, ContentDetailRequest, ContentServiceConfig } from '..';
import { Observable } from 'rxjs';
import { DbService, ReadQuery } from '../../db';
import { ContentEntry } from '../db/schema';
export declare class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private dbService;
    private contentServiceConfig?;
    private apiService?;
    private readonly GET_CONTENT_DETAILS_ENDPOINT;
    constructor(dbService: DbService, contentServiceConfig?: ContentServiceConfig | undefined, apiService?: ApiService | undefined);
    static getReadContentQuery(identifier: string): ReadQuery;
    handle(request: ContentDetailRequest): Observable<Content>;
    private readContentFromDB;
    getContentFromDB(contentId: string): Promise<ContentEntry.SchemaMap[]>;
    private fetchFromServer;
}
