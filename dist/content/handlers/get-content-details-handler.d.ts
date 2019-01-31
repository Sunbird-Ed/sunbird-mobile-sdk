import { ApiRequestHandler } from '../../api';
import { ContentDetailRequest } from '../def/requests';
import { Content } from '../def/content';
import { Observable } from 'rxjs';
import { DbService, ReadQuery } from '../../db';
import { ContentEntry } from '../db/schema';
import { ContentServiceConfig } from '../config/content-config';
import { SessionAuthenticator } from '../../auth';
import { ApiService } from '../../api/def/api-service';
export declare class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private dbService;
    private contentServiceConfig?;
    private sessionAuthenticator?;
    private apiService?;
    private readonly GET_CONTENT_DETAILS_ENDPOINT;
    constructor(dbService: DbService, contentServiceConfig?: ContentServiceConfig | undefined, sessionAuthenticator?: SessionAuthenticator | undefined, apiService?: ApiService | undefined);
    static getReadContentQuery(identifier: string): ReadQuery;
    handle(request: ContentDetailRequest): Observable<Content>;
    private readContentFromDB;
    getContentFromDB(contentId: string): Promise<ContentEntry.SchemaMap[]>;
    private fetchFromServer;
}
