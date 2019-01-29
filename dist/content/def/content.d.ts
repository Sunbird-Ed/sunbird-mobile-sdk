import { Rollup } from '../../telemetry';
export interface Content {
    identifier: string;
    contentData: ContentData;
    mimeType: string;
    basePath: string;
    contentType: string;
    referenceCount: number;
    lastUpdatedTime: number;
    isAvailableLocally: boolean;
    isUpdateAvailable: boolean;
    contentFeedback?: ContentFeedback;
    contentAccess?: Access;
    children?: Content[];
    hierarchyInfo?: HierarchyInfo[];
    sizeOnDevice: number;
    lastUsedTime: number;
    rollup?: Rollup;
}
export interface ContentData {
    identifier: string;
    name: string;
    appIcon: string;
    description: string;
    pkgVersion: string;
    status: string;
    size: string;
    owner: string;
    creator: string;
    subject: string;
    board: string;
    medium: string;
    publisher: string;
    me_totalRatings: string;
    me_averageRating: string;
    me_totalDownloads: string;
    copyright: string;
    license: string;
    expires: string;
    downloadUrl: string;
    variants: any;
    artifactUrl: string;
    language: string[];
    gradeLevel: string[];
    osId: string;
    contentType: string;
    resourceType: string;
    mimeType: string;
    artifactMimeType: string;
    versionKey: string;
    contentEncoding: string;
    contentDisposition: string;
    contentTypesCount: string;
    lastPublishedOn: string;
    createdOn: string;
    createdBy: string;
    channel: string;
    screenshots: string[];
    audience: any;
    pragma: string[];
    attributions: string[];
    dialcodes: string[];
    childNodes: string[];
    previewUrl: string;
    framework: string;
    creators: string;
    contributors: string;
    streamingUrl: string;
}
export interface ContentFeedback {
    contentId: string;
    rating: number;
    comments: string;
    createdAt: number;
    stageId: string;
    contentVersion: string;
}
export interface Access {
    status: number;
    contentId: string;
    contentLearnerState: LearnerState;
}
export interface LearnerState {
    learnerState: {
        [key: string]: any;
    };
}
export interface HierarchyInfo {
    identifier: string;
    contentType: string;
}
