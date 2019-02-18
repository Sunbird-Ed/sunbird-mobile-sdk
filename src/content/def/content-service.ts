import {
    ChildContentRequest,
    ContentDeleteRequest,
    ContentDetailRequest, ContentExportRequest,
    ContentExportResponse,
    ContentImportRequest, ContentMarkerRequest, ContentRequest,
    ContentSearchCriteria,
    EcarImportRequest
} from './requests';
import {Response} from '../../api';
import {Observable} from 'rxjs';
import {Content, HierarchyInfo} from './content';
import {ContentDeleteResponse, ContentSearchResult} from './response';


export interface ContentService {

    getContentDetails(request: ContentDetailRequest): Observable<Content>;

    getContents(criteria: ContentRequest): Observable<Content>;

    getChildContents(childContentRequest: ChildContentRequest): Observable<Content>;

    searchContent(criteria: ContentSearchCriteria): Observable<ContentSearchResult>;

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<ContentDeleteResponse[]>;

    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content>;

    nextContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content>;

    importEcar(ecarImportRequest: EcarImportRequest): Observable<Response>;

    importContent(contentImportRequest: ContentImportRequest): Observable<Response>;

    subscribeForImportStatus(contentId: string): Observable<Response>;

    cancelImport(contentId: string);

    exportContent(contentExportRequest: ContentExportRequest): Observable<Response>;

    getDownloadState(): Promise<Response>;

    cancelDownload(contentId: string): Observable<undefined>;

    setContentMarker(contentMarkerRequest: ContentMarkerRequest): Observable<boolean>;
}
