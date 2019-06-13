import { ApiRequestHandler, ApiService } from '../../api';
import { Content, ContentData, ContentDecorateRequest, ContentDetailRequest, ContentFeedbackService, ContentServiceConfig } from '..';
import { Observable } from 'rxjs';
import { DbService, ReadQuery } from '../../db';
import { ContentEntry } from '../db/schema';
import { ProfileService } from '../../profile';
import { EventsBusService } from '../../events-bus';
export declare class GetContentDetailsHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private contentFeedbackService;
    private profileService;
    private apiService;
    private contentServiceConfig;
    private dbService;
    private eventsBusService;
    private readonly GET_CONTENT_DETAILS_ENDPOINT;
    constructor(contentFeedbackService: ContentFeedbackService, profileService: ProfileService, apiService: ApiService, contentServiceConfig: ContentServiceConfig, dbService: DbService, eventsBusService: EventsBusService);
    static getReadContentQuery(identifier: string): ReadQuery;
    static isUnit(contentDbEntry: ContentEntry.SchemaMap): boolean;
    handle(request: ContentDetailRequest): Observable<Content>;
    /** @internal */
    fetchFromDB(contentId: string): Observable<ContentEntry.SchemaMap | undefined>;
    fetchFromDBForAll(contentIds: string): Observable<ContentEntry.SchemaMap[]>;
    fetchFromServer(request: ContentDetailRequest): Observable<ContentData>;
    fetchAndDecorate(request: ContentDetailRequest): Observable<Content>;
    /** @internal */
    decorateContent(request: ContentDecorateRequest): Observable<Content>;
    private attachContentAccess;
    private attachFeedback;
    private attachContentMarker;
}
