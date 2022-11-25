import {
    ChildContentRequest,
    ContentDelete,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentExportRequest,
    ContentImportRequest,
    ContentMarkerRequest,
    ContentRequest,
    ContentSearchCriteria,
    ContentSpaceUsageSummaryRequest,
    ContentSpaceUsageSummaryResponse,
    EcarImportRequest,
    RelevantContentRequest,
} from './requests';
import {ApiRequestHandler, Response} from '../../api';
import {Observable} from 'rxjs';
import {Content, HierarchyInfo} from './content';
import {
    ContentDeleteResponse,
    ContentExportResponse,
    ContentImportResponse,
    ContentSearchResult,
    RelevantContentResponsePlayer, SearchResponse
} from './response';
import {DownloadCompleteDelegate} from '../../util/download/def/download-complete-delegate';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {ContentAggregator} from '../handlers/content-aggregator';
import {FormService} from '../../form';
import {CourseService} from '../../course';
import {ProfileService} from '../../profile';
import {SearchRequest} from "./search-request";


export interface ContentService extends DownloadCompleteDelegate, SdkServiceOnInitDelegate {

    getContentDetails(request: ContentDetailRequest): Observable<Content>;

    getContentHeirarchy(request: ContentDetailRequest): Observable<Content>;

    getContents(criteria: ContentRequest): Observable<Content[]>;

    getChildContents(childContentRequest: ChildContentRequest): Observable<Content>;

    searchContent(
        criteria: ContentSearchCriteria,
        request?: { [key: string]: any },
        apiHandler?: ApiRequestHandler<SearchRequest, SearchResponse>,
        isFromContentAggregator?: boolean
    ): Observable<ContentSearchResult>;

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

    getContentSpaceUsageSummary(contentSpaceUsageSummaryRequest: ContentSpaceUsageSummaryRequest):
        Observable<ContentSpaceUsageSummaryResponse[]>;

    buildContentAggregator(
        formService: FormService,
        courseService: CourseService,
        profileService: ProfileService,
    ): ContentAggregator;


    getQuestionList(questionIds: string[], parentId?: string): Observable<any>
    
    getQuestionSetHierarchy(data): Observable<any>;

    getQuestionSetRead(contentId:string , params?: any): Observable<any>;

    getQuestionSetChildren(questionSetId: string): Promise<any[]>

    formatSearchCriteria(requestMap: { [key: string]: any }): ContentSearchCriteria;

    downloadTranscriptFile(directory): Promise<any>;
}
