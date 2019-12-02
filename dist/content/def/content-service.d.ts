import { ChildContentRequest, ContentDelete, ContentDeleteRequest, ContentDetailRequest, ContentExportRequest, ContentImportRequest, ContentMarkerRequest, ContentRequest, ContentSearchCriteria, ContentSpaceUsageSummaryRequest, ContentSpaceUsageSummaryResponse, EcarImportRequest, RelevantContentRequest } from './requests';
import { Response } from '../../api';
import { Observable } from 'rxjs';
import { Content, HierarchyInfo } from './content';
import { ContentDeleteResponse, ContentExportResponse, ContentImportResponse, ContentSearchResult, ContentsGroupedByPageSection, RelevantContentResponsePlayer } from './response';
import { DownloadCompleteDelegate } from '../../util/download/def/download-complete-delegate';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
export interface ContentService extends DownloadCompleteDelegate, SdkServiceOnInitDelegate {
    getContentDetails(request: ContentDetailRequest): Observable<Content>;
    getContentHeirarchy(request: ContentDetailRequest): Observable<Content>;
    getContents(criteria: ContentRequest): Observable<Content[]>;
    getChildContents(childContentRequest: ChildContentRequest): Observable<Content>;
    searchContent(criteria: ContentSearchCriteria, request?: {
        [key: string]: any;
    }): Observable<ContentSearchResult>;
    searchContentGroupedByPageSection(request: ContentSearchCriteria): Observable<ContentsGroupedByPageSection>;
    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<ContentDeleteResponse[]>;
    enqueueContentDelete(contentDeleteRequest: ContentDeleteRequest): Observable<void>;
    clearContentDeleteQueue(): Observable<void>;
    getContentDeleteQueue(): Observable<ContentDelete[]>;
    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content>;
    nextContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content>;
    getRelevantContent(relevantContentRequest: RelevantContentRequest): Observable<RelevantContentResponsePlayer>;
    importEcar(ecarImportRequest: EcarImportRequest): Observable<ContentImportResponse[]>;
    importContent(contentImportRequest: ContentImportRequest): Observable<ContentImportResponse[]>;
    subscribeForImportStatus(contentId: string): Observable<Response>;
    cancelImport(contentId: string): Observable<any>;
    exportContent(contentExportRequest: ContentExportRequest): Observable<ContentExportResponse>;
    getDownloadState(): Promise<Response>;
    cancelDownload(contentId: string): Observable<undefined>;
    setContentMarker(contentMarkerRequest: ContentMarkerRequest): Observable<boolean>;
    getContentSpaceUsageSummary(contentSpaceUsageSummaryRequest: ContentSpaceUsageSummaryRequest): Observable<ContentSpaceUsageSummaryResponse[]>;
}
