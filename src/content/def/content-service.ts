import {
    ChildContentRequest,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentExportResponse,
    ContentImportRequest,
    ContentRequest,
    EcarImportRequest
} from './requests';
import {Response} from '../../api';
import {Observable} from 'rxjs';
import {Content} from './content';


export interface ContentService {

    getContentDetails(request: ContentDetailRequest): Observable<Content>;

    getContents(criteria: ContentRequest): Observable<Response>;

    getChildContents(childContentRequest: ChildContentRequest): Observable<Response>;

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<Response>;

    prevContent(request: ChildContentRequest): Observable<Response<Content>>;

    nextContent(request: ChildContentRequest): Observable<Response<Content>>;

    importEcar(ecarImportRequest: EcarImportRequest): Observable<Response>;

    importContent(contentImportRequest: ContentImportRequest): Observable<Response>;

    subscribeForImportStatus(contentId: string): Observable<Response>;

    cancelImport(contentId: string);

    exportContent(contentExportRequest: ContentExportResponse);

    getDownloadState(): Promise<Response>;

}
