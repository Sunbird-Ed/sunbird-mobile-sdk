import {ContentService} from '../def/content-service';
import {Observable} from 'rxjs';
import {
    ChildContentRequest,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentExportResponse,
    ContentImportRequest,
    ContentRequest,
    EcarImportRequest
} from '../def/requests';
import {Content} from '../def/content';
import {ApiService} from '../../api';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {SessionAuthenticator} from '../../auth';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {DbService} from '../../db';
import {ContentServiceConfig} from '../config/content-config';

export class ContentServiceImpl implements ContentService {
    constructor(private apiService: ApiService,
                private dbService: DbService,
                private profileService: ProfileService,
                private contentServiceConfig: ContentServiceConfig,
                private keyValueStore: KeyValueStore,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getContentDetails(request: ContentDetailRequest): Observable<Content> {
        return new GetContentDetailsHandler(
            this.dbService, this.contentServiceConfig, this.sessionAuthenticator, this.apiService).handle(request);
    }

    cancelImport(contentId: string) {
        // TODO
        throw new Error('Not Implemented yet');
    }

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    exportContent(contentExportRequest: ContentExportResponse) {
        // TODO
        throw new Error('Not Implemented yet');
    }

    getChildContents(childContentRequest: ChildContentRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    getContents(criteria: ContentRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    getDownloadState(): Promise<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importContent(contentImportRequest: ContentImportRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importEcar(ecarImportRequest: EcarImportRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    nextContent(request: ChildContentRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    prevContent(request: ChildContentRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    subscribeForImportStatus(contentId: string): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }
}
