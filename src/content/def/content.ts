import {Content as ContentData} from '@project-sunbird/client-services/models/content/index';
import {Rollup} from '../../telemetry';
import {ContentAccess} from '../../profile';
import {ContentMarker} from './response';

export {
    Content as ContentData, LicenseDetails, OriginData, Trackable, TrackingEnabled
} from '@project-sunbird/client-services/models/content/index';

export interface Content {
    identifier: string;
    name: string;
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
    primaryCategory?: string;
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
    primaryCategory?: string;
}


