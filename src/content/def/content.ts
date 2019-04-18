import {Rollup} from '../../telemetry';
import {ContentAccess} from '../../profile/def/content-access';
import {ContentMarker} from './response';

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
    children?: Content[];
    hierarchyInfo?: HierarchyInfo[];
    sizeOnDevice: number;
    lastUsedTime: number;
    rollup?: Rollup;
    contentFeedback?: ContentFeedback[];
    contentAccess?: ContentAccess[];
    contentMarker?: ContentMarker[];
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
    subject: string | string[];
    board: string;
    medium: string | string[];
    publisher: string;
    me_totalRatings: string;
    me_averageRating: string;
    me_totalDownloads: string;
    copyright: string;
    license: string;
    expires: string;
    downloadUrl: string;
    variants: { [key: string]: any };
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
    totalScore: any;
}

export interface ContentFeedback {
    contentId: string;
    rating: number;
    comments: string;
    createdAt?: number;
    stageId?: string;
    contentVersion: string;
}

export interface ContentFeedbackFilterCriteria {
    uid: string;
    contentId: string;
}

export interface HierarchyInfo {
    identifier: string;
    contentType: string;
}


