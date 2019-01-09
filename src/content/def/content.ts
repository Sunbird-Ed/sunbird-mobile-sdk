import {Feedback} from './Feedback';
import {Access} from './Access';
import {Data} from './data';
import {HierarchyInfo} from './HierarchyInfo';
import {Rollup} from './Rollup';

export interface Content {
    identifier: string;
    contentData: Data;
    mimeType: string;
    basePath: string;
    contentType: string;
    referenceCount: number;
    lastUpdatedTime: number;
    isAvailableLocally: boolean;
    isUpdateAvailable: boolean;
    contentFeedback: Feedback;
    contentAccess: Access;
    children: Content[];
    hierarchyInfo: HierarchyInfo[];
    sizeOnDevice: number;
    lastUsedTime: number;
    rollup: Rollup;
}

