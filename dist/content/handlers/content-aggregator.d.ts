import { ContentAggregatorRequest, ContentAggregatorResponse, ContentData, ContentSearchCriteria, ContentService, ContentsGroupedByPageSection } from '..';
import { Observable } from 'rxjs';
import { CachedItemStore } from '../../key-value-store';
import { SearchRequest } from '../def/search-request';
import { FormRequest, FormService } from '../../form';
import { SearchContentHandler } from './search-content-handler';
import { CsContentGroup } from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import { CourseService } from '../../course';
import { ProfileService } from '../../profile';
import { ApiService, SerializedRequest } from '../../api';
import { NetworkInfoService } from '../../util/network';
declare type Primitive = string | number | boolean;
interface AggregationConfig {
    filterBy?: {
        [field in keyof ContentData]: {
            operation: any;
            value: any;
        };
    }[];
    sortBy?: {
        [field in keyof ContentData]: 'asc' | 'desc' | {
            order: 'asc' | 'desc';
            preference: Primitive[];
        };
    }[];
    groupBy?: keyof ContentData;
    groupSortBy?: {
        [field in keyof CsContentGroup]: 'asc' | 'desc' | {
            order: 'asc' | 'desc';
            preference: Primitive[];
        };
    }[];
    groupFilterBy?: {
        [field in keyof CsContentGroup]: {
            operation: any;
            value: any;
        };
    }[];
}
export interface DataSourceModelMap {
    'CONTENTS': {
        type: 'CONTENTS';
        tag?: string;
        request: Partial<SerializedRequest>;
        mapping: {
            applyFirstAvailableCombination?: boolean;
            aggregate?: AggregationConfig;
        }[];
    };
    'TRACKABLE_COLLECTIONS': {
        type: 'TRACKABLE_COLLECTIONS';
        tag?: string;
        request: Partial<SerializedRequest>;
        mapping: {
            aggregate?: AggregationConfig;
        }[];
    };
    'CONTENT_FACETS': {
        type: 'CONTENT_FACETS';
        tag?: string;
        values?: DataResponseMap['CONTENT_FACETS'];
        request: Partial<SerializedRequest>;
        mapping: {
            facet: string;
            aggregate?: AggregationConfig;
        }[];
    };
    'RECENTLY_VIEWED_CONTENTS': {
        type: 'RECENTLY_VIEWED_CONTENTS';
        tag?: string;
        mapping: {
            aggregate?: AggregationConfig;
        }[];
    };
}
export interface DataResponseMap {
    'TRACKABLE_COLLECTIONS': ContentsGroupedByPageSection;
    'CONTENT_FACETS': {
        facet: string;
        index?: number;
        searchCriteria: ContentSearchCriteria;
        primaryFacetFilters?: any;
        aggregate?: AggregationConfig;
    }[];
    'RECENTLY_VIEWED_CONTENTS': ContentsGroupedByPageSection;
    'CONTENTS': ContentsGroupedByPageSection;
}
export declare type DataSourceType = keyof DataSourceModelMap;
export interface AggregatorConfigField<T extends DataSourceType = any> {
    dataSrc: DataSourceModelMap[T];
    sections: {
        index: number;
        code: string;
        description?: string;
        title: string;
        theme: any;
    }[];
}
export interface ContentAggregation<T extends DataSourceType = any> {
    index: number;
    title: string;
    description?: string;
    data: DataResponseMap[T];
    dataSrc: DataSourceModelMap[T];
    theme: any;
    meta?: {
        filterCriteria?: ContentSearchCriteria;
        searchRequest?: SearchRequest;
        searchCriteria?: ContentSearchCriteria;
    };
}
export declare class ContentAggregator {
    private searchContentHandler;
    private formService;
    private contentService;
    private cachedItemStore;
    private courseService;
    private profileService;
    private apiService;
    private networkInfoService;
    private static searchContentCache;
    private static CONTENT_AGGREGATION_KEY;
    private static buildRequestHash;
    constructor(searchContentHandler: SearchContentHandler, formService: FormService, contentService: ContentService, cachedItemStore: CachedItemStore, courseService: CourseService, profileService: ProfileService, apiService: ApiService, networkInfoService: NetworkInfoService);
    aggregate(request: ContentAggregatorRequest, excludeDataSrc: DataSourceType[], formRequest?: FormRequest, formFields?: AggregatorConfigField[], cacheable?: boolean): Observable<ContentAggregatorResponse>;
    private buildRecentlyViewedTask;
    private buildFacetsTask;
    private buildTrackableCollectionsTask;
    private buildContentSearchTask;
    private buildFilterByCriteria;
    private buildSortByCriteria;
    private buildSearchRequestAndCriteria;
    private searchContents;
}
export {};
