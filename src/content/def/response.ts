import {ContentSearchCriteria, ContentSearchFilter} from './requests';
import {Content, ContentData} from './content';
import {ContentImportStatus} from '..';
import { Course } from '../../course/def/course';
import {ContentAggregation} from '../handlers/content-aggregator';

export interface ContentSearchResult {
    id: string;
    responseMessageId: string;
    filterCriteria: ContentSearchCriteria;
    request?: { [key: string]: any };
    contentDataList: ContentData[];
    collectionDataList?: ContentData[];
    count?: number;
}

export interface ContentAggregatorResponse {
    result: ContentAggregation[];
}

export interface ContentsGroupedByPageSection {
    name: string;
    combination?: {
        [key in keyof Content]?: string
    };
    sections: PageSection[];
}

export interface PageSection {
    count?: number;
    name?: string;
    contents?: ContentData[] | Course[];
    display?: Display;
    totalCount?: number;
}

export interface Display {
    name: { [key: string]: any };
}

export interface SearchResponse {
    id: string;
    params: { resmsgid: string };
    result: {
        count: number,
        content: ContentData[],
        collections: ContentData[],
        facets: ContentSearchFilter[],
        QuestionSet?: ContentData[]
    };
}

export interface ChildContent {
    identifier: string;
    name: string;
    objectType: string;
    relation: string;
    index: number;
}

export interface ContentImportResponse {
    identifier: string;
    status: ContentImportStatus;
}

export interface ContentDeleteResponse {
    identifier: string;
    status: ContentDeleteStatus;
}

export enum ContentDeleteStatus {
    NOT_FOUND = -1,
    DELETED_SUCCESSFULLY = 1
}

export interface ContentMarker {
    contentId: string;
    uid: string;
    extraInfoMap: { [key: string]: any };
    marker: number;
}

export interface ContentExportResponse {
    exportedFilePath: string;
}

export interface RelevantContentResponse {
    nextContent?: Content;
    previousContent?: Content;
}

export interface RelevantContentResponsePlayer {
    prev?: { content: Content };
    next?: { content: Content };
}
