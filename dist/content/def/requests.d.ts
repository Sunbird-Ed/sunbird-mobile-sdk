import { ContentData, SearchType } from '..';
import { Content, HierarchyInfo } from './content';
import { CorrelationData, Rollup } from '../../telemetry';
import { ContentImportResponse } from './response';
import { ContentEntry } from '../db/schema';
import { DownloadRequest } from '../../util/download';
export interface ContentDecorateRequest {
    content: Content;
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
}
export interface ContentDetailRequest {
    contentId: string;
    emitUpdateIfAny?: boolean;
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
}
export interface ContentRequest {
    uid?: string | string[];
    contentTypes: string[];
    audience?: string[];
    pragma?: string[];
    exclPragma?: string[];
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
    sortCriteria?: ContentSortCriteria[];
    recentlyViewed?: boolean;
    localOnly?: boolean;
    resourcesOnly?: boolean;
    limit?: number;
    board?: string[];
    medium?: string[];
    grade?: string[];
}
export interface ContentSortCriteria {
    sortAttribute: string;
    sortOrder: SortOrder;
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export interface ChildContentRequest {
    contentId: string;
    hierarchyInfo: HierarchyInfo[];
    level?: number;
}
export interface ContentDeleteRequest {
    contentDeleteList: ContentDelete[];
}
export interface ContentDelete {
    contentId: string;
    isChildContent: boolean;
}
export interface EcarImportRequest {
    isChildContent: boolean;
    destinationFolder: string;
    sourceFilePath: string;
    correlationData: CorrelationData[];
    rollUp?: Rollup;
    identifier?: string;
}
export interface ContentImportRequest {
    withPriority?: number;
    contentImportArray: ContentImport[];
    contentStatusArray: string[];
    fields?: (keyof ContentData)[];
}
export interface ContentImport {
    isChildContent: boolean;
    destinationFolder: string;
    contentId: string;
    correlationData?: CorrelationData[];
    rollUp?: Rollup;
}
export interface ContentExportRequest {
    destinationFolder: string;
    contentIds: string[];
    saveLocally?: boolean;
}
export interface ContentMarkerRequest {
    contentId: string;
    uid: string;
    data: string;
    extraInfo: {
        [key: string]: any;
    };
    marker: MarkerType;
    isMarked: boolean;
}
export declare enum MarkerType {
    NOTHING = 0,
    PREVIEWED = 1,
    BOOKMARKED = 2
}
export interface ContentSearchCriteria {
    query?: string;
    exists?: string[];
    offset?: number;
    limit?: number;
    mode?: string;
    age?: number;
    grade?: string[];
    medium?: string[];
    board?: string[];
    createdBy?: string[];
    audience?: string[];
    channel?: string[];
    purpose?: string[];
    topic?: string[];
    pragma?: string[];
    exclPragma?: string[];
    contentStatusArray?: string[];
    facets?: string[];
    contentTypes?: string[];
    keywords?: string[];
    dialCodes?: string[];
    language?: string[];
    offlineSearch?: boolean;
    facetFilters?: ContentSearchFilter[];
    impliedFilters?: ContentSearchFilter[];
    impliedFiltersMap?: {
        [key: string]: any;
    }[];
    sortCriteria?: ContentSortCriteria[];
    searchType?: SearchType;
    framework?: string;
    languageCode?: string;
    mimeType?: string[];
    subject?: string[];
    fields?: string[];
}
export interface ContentSearchFilter {
    name: string;
    values: FilterValue[];
}
export interface FilterValue {
    name: string;
    count?: number;
    apply: boolean;
    translations?: string;
    description?: string;
    index?: number;
}
export interface ContentSortCriteria {
    sortAttribute: string;
    sortOrder: SortOrder;
}
export interface ImportContentContext {
    isChildContent: boolean;
    ecarFilePath: string;
    destinationFolder: string;
    metadata?: any;
    manifestVersion?: string;
    skippedItemsIdentifier?: string[];
    items?: any[];
    identifiers?: string[];
    contentImportResponseList: ContentImportResponse[];
    tmpLocation?: string;
    rootIdentifier?: string;
    correlationData?: CorrelationData[];
    rollUp?: Rollup;
    existedContentIdentifiers?: {
        [identifier: string]: boolean;
    };
    contentIdsToDelete: Set<string>;
    identifier?: string;
}
export interface ExportContentContext {
    ecarFilePath?: string;
    tmpLocationPath?: string;
    destinationFolder: string;
    items?: any[];
    contentModelsToExport: ContentEntry.SchemaMap[];
    metadata: {
        [key: string]: any;
    };
    manifest?: any;
}
export interface ContentDownloadRequest extends DownloadRequest {
    contentMeta: Partial<Content>;
    isChildContent?: boolean;
    correlationData?: CorrelationData[];
    rollUp?: Rollup;
}
export interface RelevantContentRequest extends DownloadRequest {
    hierarchyInfo?: HierarchyInfo[];
    contentIdentifier?: string;
    next?: boolean;
    prev?: boolean;
    shouldConvertBasePath?: boolean;
}
export interface ContentSpaceUsageSummaryRequest {
    paths: string[];
}
export interface ContentSpaceUsageSummaryResponse {
    path: string;
    sizeOnDevice: number;
}
