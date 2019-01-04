export interface ContentDetailRequest {
    contentId: string;
    attachFeedback?: boolean;
    attachContentAccess?: boolean;
    attachContentMarker?: boolean;
    returnCache?: boolean;
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

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export interface ChildContentRequest {
    contentId: string;
    hierarchyInfo: HierarchyInfo[];
    level: string[];
}

export interface HierarchyInfo {
    identifier: string;
    contentType: string;
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

export interface CorrelationData {
    type: string;
    id: string;
}

export interface ContentImportRequest {
    contentImportMap?: { [index: string]: any };
    contentStatusArray: string[];
}

export enum ContentImportStatus {
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

export enum DownloadAction {
    RESUME = 0,
    PAUSE = 1
}




