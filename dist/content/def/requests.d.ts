import { SearchType } from '../util/content-constants';
import { HierarchyInfo } from './content';
import { CorrelationData } from '../../telemetry';
export interface ContentDetailRequest {
    contentId: string;
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
}
export interface ContentRequest {
    uid: string;
    contentTypes: string[];
    audience: string[];
    pragma: string[];
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
    sortCriteria?: ContentSortCriteria[];
    recentlyViewed?: boolean;
    localOnly?: boolean;
    limit?: number;
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
    level: number;
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
}
export interface ContentImportRequest {
    contentImportMap?: {
        [index: string]: any;
    };
    contentStatusArray: string[];
}
export declare enum ContentImportStatus {
    NOT_FOUND = -1,
    ENQUEUED_FOR_DOWNLOAD = 0,
    DOWNLOAD_STARTED = 1,
    DOWNLOAD_FAILED = 2,
    DOWNLOAD_COMPLETED = 3,
    IMPORT_STARTED = 4,
    IMPORT_FAILED = 5,
    NOT_COMPATIBLE = 6,
    CONTENT_EXPIRED = 7,
    ALREADY_EXIST = 8,
    IMPORT_COMPLETED = 100
}
export interface ContentExportResponse {
    exportedFilePath: string;
}
export interface ContentSearchCriteria {
    query: string;
    exists: string[];
    offset: number;
    limit: number;
    mode: string;
    age: number;
    grade: string[];
    medium: string[];
    board: string[];
    createdBy: string[];
    audience: string[];
    channel: string[];
    purpose: string[];
    pragma: string[];
    exclPragma: string[];
    contentStatusArray: string[];
    facets: string[];
    contentTypes: string[];
    keywords: string[];
    dialCodes: string[];
    language: string[];
    offlineSearch: boolean;
    facetFilters: ContentSearchFilter[];
    impliedFilters: ContentSearchFilter[];
    impliedFiltersMap: Array<any>;
    sortCriteria: ContentSortCriteria[];
    searchType: SearchType;
    framework: string;
    languageCode: string;
}
export interface ContentSearchFilter {
    name: string;
    values: FilterValue[];
}
export interface FilterValue {
    name: string;
    count: number;
    apply: boolean;
    translations: string;
}
export interface ContentSortCriteria {
    sortAttribute: string;
    sortOrder: SortOrder;
}
