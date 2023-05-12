import {
    Content,
    ContentAggregatorRequest,
    ContentAggregatorResponse,
    ContentData,
    ContentRequest,
    ContentSearchCriteria,
    ContentSearchResult,
    ContentService,
    ContentsGroupedByPageSection,
    SearchResponse,
} from '..';
import {defer, Observable, of} from 'rxjs';
import {catchError, map, take, tap} from 'rxjs/operators';
import {CachedItemStore} from '../../key-value-store';
import {SearchRequest} from '../def/search-request';
import {FormRequest, FormService} from '../../form';
import {SearchContentHandler} from './search-content-handler';
import {
    CsSortCriteria,
    CsFilterCriteria,
} from '@project-sunbird/client-services/services/content';
import {
    CsContentsGroupGenerator,
    CsContentGroup
} from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import {CourseService} from '../../course';
import {ProfileService} from '../../profile';
import {ApiRequestHandler, ApiService, Request, SerializedRequest} from '../../api';
import {GetEnrolledCourseResponse} from '../../course/def/get-enrolled-course-response';
import {CsResponse} from '@project-sunbird/client-services/core/http-service';
import {ObjectUtil} from '../../util/object-util';
import * as SHA1 from 'crypto-js/sha1';
import {NetworkInfoService, NetworkStatus} from '../../util/network';
import { MimeTypeCategoryMapping } from '@project-sunbird/client-services/models/content/index';

type Primitive = string | number | boolean;
type RequestHash = string;
interface AggregationTask<T extends DataSourceType = any> {
    requestHash: RequestHash;
    task: Observable<ContentAggregation<T>[]>;
}

interface AggregationConfig {
    filterBy?: {
        [field in keyof ContentData]: {
            operation: any,
            value: any
        }
    }[];
    sortBy?: {
        [field in keyof ContentData]: 'asc' | 'desc' | { order: 'asc' | 'desc', preference: Primitive[] }
    }[];
    groupBy?: keyof ContentData;
    groupSortBy?: {
        [field in keyof CsContentGroup]: 'asc' | 'desc' | { order: 'asc' | 'desc', preference: Primitive[] }
    }[];
    groupFilterBy?: {
        [field in keyof CsContentGroup]: {
            operation: any,
            value: any
        }
    }[];
}

export interface DataSourceModelMap {
    'CONTENTS': {
        type: 'CONTENTS',
        tag?: string,
        request: Partial<SerializedRequest>,
        mapping: {
            applyFirstAvailableCombination?: boolean,
            aggregate?: AggregationConfig
        }[]
    };
    'TRACKABLE_COLLECTIONS': {
        type: 'TRACKABLE_COLLECTIONS',
        tag?: string,
        request: Partial<SerializedRequest>,
        mapping: {
            aggregate?: AggregationConfig
        }[]
    };
    'CONTENT_FACETS': {
        type: 'CONTENT_FACETS',
        tag?: string,
        values?: DataResponseMap['CONTENT_FACETS']
        request: Partial<SerializedRequest>,
        mapping: {
            facet: string,
            aggregate?: AggregationConfig,
            filterPillBy?: string
        }[],
        params?: any
    };
    'RECENTLY_VIEWED_CONTENTS': {
        type: 'RECENTLY_VIEWED_CONTENTS',
        tag?: string,
        mapping: {
            aggregate?: AggregationConfig
        }[]
    };
    'CONTENT_DISCOVERY_BANNER': {
        type: 'CONTENT_DISCOVERY_BANNER',
        tag?: string,
        values?: DataResponseMap['CONTENT_DISCOVERY_BANNER']
        mapping: {}[]
    };
}

export interface DataResponseMap {
    'TRACKABLE_COLLECTIONS': ContentsGroupedByPageSection;
    'CONTENT_FACETS': {
        facet: string;
        index?: number;
        searchCriteria: ContentSearchCriteria;
        primaryFacetFilters?: any;
        aggregate?: AggregationConfig
    }[];
    'RECENTLY_VIEWED_CONTENTS': ContentsGroupedByPageSection;
    'CONTENTS': ContentsGroupedByPageSection;
    'CONTENT_DISCOVERY_BANNER': {
        code: string;
        ui: {
            background: string;
            text: string;
        };
        action: {
            type: string;
            subType: string;
            params: any;
        };
        expiry: string;
    }[];
}

export type DataSourceType = keyof DataSourceModelMap;

export interface AggregatorConfigField<T extends DataSourceType = any> {
    dataSrc: DataSourceModelMap[T];
    sections: {
        index: number;
        code: string;
        description?: string;
        title: string;
        theme: any;
        isEnabled: boolean;
        landingDetails? : {
            title?: string;
            description?: string;
        }
    }[];
}

export interface ContentAggregation<T extends DataSourceType = any> {
    index: number;
    title: string;
    description?: string;
    landingDetails? : {
        title?: string;
        description?: string;
    }
    data: DataResponseMap[T];
    dataSrc: DataSourceModelMap[T];
    theme: any;
    meta?: {
        filterCriteria?: ContentSearchCriteria;
        searchRequest?: SearchRequest;
        searchCriteria?: ContentSearchCriteria;
    };
}

export class ContentAggregator {
    private static searchContentCache = new Map<string, CsResponse<SearchResponse>>();
    private static CONTENT_AGGREGATION_KEY = 'content-aggregation';

    private static buildRequestHash(request: any) {
        return SHA1(
            JSON.stringify(ObjectUtil.withDeeplyOrderedKeys(request))
        ).toString();
    }

    constructor(
        private searchContentHandler: SearchContentHandler,
        private formService: FormService,
        private contentService: ContentService,
        private cachedItemStore: CachedItemStore,
        private courseService: CourseService,
        private profileService: ProfileService,
        private apiService: ApiService,
        private networkInfoService: NetworkInfoService
    ) {
    }

    aggregate(
        request: ContentAggregatorRequest,
        excludeDataSrc: DataSourceType[],
        formRequest?: FormRequest,
        formFields?: AggregatorConfigField[],
        cacheable = false
    ): Observable<ContentAggregatorResponse> {
        return defer(async () => {
            if (!formRequest && !formFields) {
                throw new Error('formRequest or formFields required');
            }

            let fields: AggregatorConfigField[] = [];
            if (formRequest) {
                formRequest.from = request.from;
                fields = await this.formService.getForm(
                    formRequest
                ).toPromise().then((r) => r.form.data.fields);
            } else if (formFields) {
                fields = formFields;
                cacheable = false;
            }

            fields = fields
                .filter((field) => excludeDataSrc.indexOf(field.dataSrc.type) === -1);

            const fieldTasks: Promise<AggregationTask>[] = fields.map(async (field) => {
                if (!field.dataSrc) {
                    throw new Error('INVALID_CONFIG');
                }

                switch (field.dataSrc.type) {
                    case 'CONTENT_FACETS':
                        return await this.buildFacetsTask(field, request);
                    case 'RECENTLY_VIEWED_CONTENTS':
                        return await this.buildRecentlyViewedTask(field, request);
                    case 'CONTENTS':
                        return await this.buildContentSearchTask(field, request);
                    case 'TRACKABLE_COLLECTIONS':
                        return await this.buildTrackableCollectionsTask(field, request);
                    case 'CONTENT_DISCOVERY_BANNER':
                        return await this.buildContentDiscoveryBannerTask(field);
                    default: {
                        console.error('UNKNOWN_DATA_SRC');
                        return { requestHash: '', task: of([]) };
                    }
                }
            });

            const builtTasks = await Promise.all(fieldTasks);

            const combinedHash = builtTasks.map(b => b.requestHash).join('-');

            const combinedTasks = defer(async () => {
                const networkStatus = await this.networkInfoService.networkStatus$.pipe(
                    take(1)
                ).toPromise();

                if (cacheable && networkStatus === NetworkStatus.OFFLINE) {
                    throw new Error('ContentAggregator: offline request');
                }

                return Promise.all(
                    builtTasks.map((b) => b.task.toPromise())
                ).then((result: ContentAggregation[][]) => {
                    return result
                        .reduce<ContentAggregation[]>((acc, v) => {
                            return [...acc, ...v];
                        }, [])
                        .sort((a, b) => a.index - b.index);
                });
            });

            return defer<Observable<ContentAggregation[]>>(() => {
                if (cacheable) {
                    return this.cachedItemStore.get<ContentAggregation[]>(
                        combinedHash,
                        ContentAggregator.CONTENT_AGGREGATION_KEY,
                        'ttl_' + ContentAggregator.CONTENT_AGGREGATION_KEY,
                        () => combinedTasks
                    );
                }

                return combinedTasks;
            }).pipe(
                map((result) => ({ result }))
            ).toPromise();
        });
    }

    private async buildRecentlyViewedTask(
        field: AggregatorConfigField<'RECENTLY_VIEWED_CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<AggregationTask<'RECENTLY_VIEWED_CONTENTS'>> {
        const session = await this.profileService.getActiveProfileSession().toPromise();

        const requestParams: ContentRequest = {
            uid: session.managedSession ? session.managedSession.uid : session.uid,
            primaryCategories: [],
            recentlyViewed: true,
            limit: 20
        };

        return {
            requestHash: 'RECENTLY_VIEWED_CONTENTS_' + ContentAggregator.buildRequestHash(requestParams),
            task: defer(async () => {
                const contents = await this.contentService.getContents(requestParams).toPromise();

                return field.sections.map((section) => {
                    return {
                        index: section.index,
                        title: section.title,
                        data: {
                            name: section.index + '',
                            sections: [
                                {
                                    name: section.index + '',
                                    count: contents.length,
                                    contents: contents.map(c => {
                                        c.contentData['cardImg'] = c.contentData.appIcon;
                                        return c;
                                    })
                                }
                            ]
                        },
                        dataSrc: field.dataSrc,
                        theme: section.theme,
                        description: section.description,
                        landingDetails: section.landingDetails,
                        isEnabled: section.isEnabled
                    } as ContentAggregation<'RECENTLY_VIEWED_CONTENTS'>;
                });
            })
        };
    }

    private async buildContentDiscoveryBannerTask(
      field: AggregatorConfigField<'CONTENT_DISCOVERY_BANNER'>,
    ): Promise<AggregationTask<'CONTENT_DISCOVERY_BANNER'>> {
        return {
            requestHash: 'CONTENT_DISCOVERY_BANNER' + ContentAggregator.buildRequestHash(field.dataSrc.type),
            task: defer(async () => {
                return field.sections.map((section) => {
                    return {
                        index: section.index,
                        code: section.code,
                        title: section.title,
                        data: field.dataSrc.values!.filter((value) => Number(value.expiry) > Math.floor(Date.now() / 1000)),
                        dataSrc: field.dataSrc,
                        theme: section.theme,
                        description: section.description,
                        landingDetails: section.landingDetails,
                        isEnabled: section.isEnabled
                    } as ContentAggregation<'CONTENT_DISCOVERY_BANNER'>;
                });
            })
        };
    }

    private async buildFacetsTask(
        field: AggregatorConfigField<'CONTENT_FACETS'>,
        request: ContentAggregatorRequest
    ): Promise<AggregationTask<'CONTENT_FACETS'>> {
        if (field.dataSrc.values) {
            return {
                requestHash: '',
                task: defer(async () => {
                    return field.sections.map((section) => {
                        return {
                            index: section.index,
                            code: section.code,
                            title: section.title,
                            data: field.dataSrc.values!.sort((a, b) => a.index! - b.index!),
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        };
                    });
                })
            };
        }

        const { searchRequest, searchCriteria } = this.buildSearchRequestAndCriteria(field, request);

        searchCriteria.facets = field.dataSrc.mapping.map((m) => m.facet);
        searchRequest.facets = searchCriteria.facets;
        searchRequest.limit = 0;
        searchRequest.offset = 0;

        return {
            requestHash: 'CONTENT_FACETS_' + ContentAggregator.buildRequestHash(searchRequest),
            task: defer(async () => {
                const searchResult = await this.searchContents(field, searchCriteria, searchRequest);
                return field.sections.map((section, index) => {
                    let searchFacetFilters =  searchResult.filterCriteria.facetFilters || [];
                    const toBeDeletedFacets: string[] = [];
                    searchFacetFilters.map((x) => {
                        const facetConfig = (field.dataSrc.params.config.find(element => element.name === x.name));
                        if (facetConfig) {
                            facetConfig.mergeableAttributes.map((attribute) => {
                                toBeDeletedFacets.push(attribute);
                                const mergeableFacets = searchFacetFilters.find(facet => facet.name === attribute);
                                x.values = x.values.filter(y =>  facetConfig.values.
                                    find(z => (z.code === y.name.replace(/\s+/g, '').toLowerCase())));
                                const configFacets = facetConfig.values.filter(configFacet => configFacet.type = attribute);
                                mergeableFacets!!.values = mergeableFacets!!.values.
                                    filter(y => configFacets.find(z => (z.code === y.name.replace(/\s+/g, ''))));
                                x.values = x.values.concat(mergeableFacets!!.values);
                            });
                        }
                    });
                    searchFacetFilters = searchFacetFilters.filter(x => toBeDeletedFacets.indexOf(x.name) === -1 );
                    const facetFilters = searchFacetFilters.find((x) =>
                        x.name === (field.dataSrc.mapping[index] && field.dataSrc.mapping[index].facet)
                    );

                    if (facetFilters) {
                        const facetConfig = field.dataSrc.params && field.dataSrc.params.config &&
                                   field.dataSrc.params.config.find(x => x.name === facetFilters.name);
                        return {
                            index: section.index,
                            title: section.title,
                            code: section.code,
                            data: facetFilters.values.map((filterValue) => {
                                const facetCategoryConfig = facetConfig ? facetConfig.values.
                                            find(x => x.code === filterValue.name.
                                            replace(/\s+/g, '').toLowerCase()) : [];
                                return {
                                    facet: facetCategoryConfig && facetCategoryConfig.name ? facetCategoryConfig.name : filterValue.name,
                                    searchCriteria: {
                                        ...searchCriteria,
                                        primaryCategories:  [],
                                        impliedFilters: facetCategoryConfig.searchCriteria &&
                                        facetCategoryConfig.searchCriteria.impliedFilters ?
                                          facetCategoryConfig.searchCriteria.impliedFilters :
                                          [{name: facetFilters.name, values: [{name: filterValue.name, apply: true}]}]
                                        // [facetFilters.name]: [filterValue.name]
                                    },
                                    aggregate: field.dataSrc.mapping[index].aggregate,
                                    filterPillBy: field.dataSrc.mapping[index].filterPillBy
                                };
                            }).sort((a, b) => {
                                if (request.userPreferences) {
                                    const facetPreferences = request.userPreferences[facetFilters.name];
                                    if (
                                        !facetPreferences ||
                                        (
                                            Array.isArray(facetPreferences) &&
                                            facetPreferences.indexOf(a.facet) > -1 &&
                                            facetPreferences.indexOf(b.facet) > -1
                                        ) ||
                                        (
                                            facetPreferences === a.facet &&
                                            facetPreferences === b.facet
                                        )
                                    ) {
                                        return a.facet.localeCompare(b.facet);
                                    }
                                    if (
                                        (
                                            Array.isArray(facetPreferences) &&
                                            facetPreferences.indexOf(a.facet) > -1
                                        ) ||
                                        (
                                            facetPreferences === a.facet
                                        )
                                    ) {
                                        return -1;
                                    }
                                    if (
                                        (
                                            Array.isArray(facetPreferences) &&
                                            facetPreferences.indexOf(b.facet) > -1
                                        ) ||
                                        (
                                            facetPreferences === b.facet
                                        )
                                    ) {
                                        return 1;
                                    }
                                }
                                return a.facet.localeCompare(b.facet);
                            }),
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        };
                    } else {
                        return {
                            index: section.index,
                            title: section.title,
                            code: section.code,
                            data: [],
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            isEnabled: section.isEnabled
                        };
                    }
                });
            })
        };
    }

    private async buildTrackableCollectionsTask(
        field: AggregatorConfigField<'TRACKABLE_COLLECTIONS'>,
        request: ContentAggregatorRequest,
    ): Promise<AggregationTask<'TRACKABLE_COLLECTIONS'>> {
        const apiService = this.apiService;
        const session = await this.profileService.getActiveProfileSession().toPromise();

        return {
            requestHash: 'TRACKABLE_COLLECTIONS_' + ContentAggregator.buildRequestHash({
                userId: session.managedSession ? session.managedSession.uid : session.uid
            }),
            task: defer(async () => {
                const courses = await this.courseService.getEnrolledCourses({
                    userId: session.managedSession ? session.managedSession.uid : session.uid,
                    returnFreshCourses: true
                }, new class implements ApiRequestHandler<{ userId: string }, GetEnrolledCourseResponse> {
                    handle({ userId }: { userId: string }): Observable<GetEnrolledCourseResponse> {
                        if (field.dataSrc.request.path) {
                            field.dataSrc.request.path = field.dataSrc.request.path.replace('${userId}', userId);
                        }
                        const apiRequest = Request.fromJSON(field.dataSrc.request);
                        return apiService.fetch<GetEnrolledCourseResponse>(apiRequest)
                            .pipe(
                                map((response) => {
                                   // response.body.result.courses.sort((a, b) => (a.enrolledDate! > b.enrolledDate! ? -1 : 1));
                                    return response.body;
                                })
                            );
                    }
                }).toPromise();

                return field.sections.map((section, index) => {
                    if (!field.dataSrc.mapping[index] || !field.dataSrc.mapping[index].aggregate) {
                        return {
                            index: section.index,
                            title: section.title,
                            data: {
                                name: section.index + '',
                                sections: [
                                    {
                                        name: section.index + '',
                                        count: courses.length,
                                        contents: courses
                                    }
                                ]
                            },
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        };
                    } else {
                        const aggregate = field.dataSrc.mapping[index].aggregate!;
                        return {
                            index: section.index,
                            title: section.title,
                            data: CsContentsGroupGenerator.generate({
                                contents: courses as any,
                                groupBy: aggregate.groupBy!,
                                sortBy: aggregate.sortBy ? this.buildSortByCriteria(aggregate.sortBy) : [],
                                filterBy: aggregate.filterBy ? this.buildFilterByCriteria(aggregate.filterBy) : [],
                                groupSortBy: aggregate.groupSortBy ? this.buildSortByCriteria(aggregate.groupSortBy) : [],
                                groupFilterBy: aggregate.groupFilterBy ? this.buildFilterByCriteria(aggregate.groupFilterBy) : [],
                                includeSearchable: false
                            }),
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        } as ContentAggregation<'TRACKABLE_COLLECTIONS'>;
                    }
                });
            })
        };
    }

    private async buildContentSearchTask(
        field: AggregatorConfigField<'CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<AggregationTask<'CONTENTS'>> {
        const { searchRequest, searchCriteria } = this.buildSearchRequestAndCriteria(field, request);

        return {
            requestHash: 'CONTENTS_' + ContentAggregator.buildRequestHash(searchRequest),
            task: defer(async () => {
                const offlineSearchContentDataList: ContentData[] = await (/* fetch offline contents */ async () => {
                    if ((searchRequest.filters && searchRequest.filters.primaryCategory) ||
                        (searchCriteria.primaryCategories && searchCriteria.primaryCategories.length === 0)) {
                        return [];
                    }
                    return this.contentService.getContents({
                        primaryCategories:
                            (searchCriteria.primaryCategories && searchCriteria.primaryCategories.length
                                && searchCriteria.primaryCategories) ||
                            (searchRequest.filters && searchRequest.filters.primaryCategory) ||
                            [],
                        board: searchCriteria.board,
                        medium: searchCriteria.medium,
                        grade: searchCriteria.grade
                    }).pipe(
                        map((contents: Content[]) => contents.map((content) => {
                            if (content.contentData.appIcon && !content.contentData.appIcon.startsWith('https://')) {
                                content.contentData.appIcon = content.basePath + content.contentData.appIcon;
                            }
                            return content.contentData;
                        }))
                    ).toPromise();
                })();

                const onlineContentsResponse = await this.searchContents(field, searchCriteria, searchRequest);

                const onlineSearchContentDataList: ContentData[] = (
                    onlineContentsResponse.contentDataList as ContentData[] || []
                ).filter((contentData) => {
                    return !offlineSearchContentDataList.find(
                        (localContentData) => localContentData.identifier === contentData.identifier);
                });
                const combinedContents: ContentData[] = offlineSearchContentDataList.concat(onlineSearchContentDataList).map(c => {
                    c['cardImg'] = c.appIcon;
                    return c;
                });
                combinedContents.sort((a, b) => (a.lastPublishedOn! > b.lastPublishedOn! ? -1 : 1));

                return field.sections.map((section, index) => {
                    if (!field.dataSrc.mapping[index] || !field.dataSrc.mapping[index].aggregate) {
                        return {
                            index: section.index,
                            title: section.title,
                            meta: {
                                searchCriteria,
                                filterCriteria: onlineContentsResponse.filterCriteria,
                                searchRequest
                            },
                            data: {
                                name: section.index + '',
                                sections: [
                                    {
                                        count: combinedContents.length,
                                        contents: combinedContents
                                    }
                                ]
                            },
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        } as ContentAggregation<'CONTENTS'>;
                    } else {
                        const aggregate = field.dataSrc.mapping[index].aggregate!;
                        const data = (() => {
                            const d = CsContentsGroupGenerator.generate({
                                contents: combinedContents,
                                groupBy: aggregate.groupBy!,
                                sortBy: aggregate.sortBy ? this.buildSortByCriteria(aggregate.sortBy) : [],
                                filterBy: aggregate.filterBy ? this.buildFilterByCriteria(aggregate.filterBy) : [],
                                groupSortBy: aggregate.groupSortBy ? this.buildSortByCriteria(aggregate.groupSortBy) : [],
                                groupFilterBy: aggregate.groupFilterBy ? this.buildFilterByCriteria(aggregate.groupFilterBy) : [],
                                combination: field.dataSrc.mapping[index].applyFirstAvailableCombination &&
                                    request.applyFirstAvailableCombination as any,
                                includeSearchable: false
                            });
                            if (request.userPreferences && request.userPreferences[aggregate.groupBy!]) {
                                d.sections.sort((a, b) => {
                                    if (
                                        request.userPreferences![aggregate.groupBy!]!.
                                        indexOf(a.name!.replace(/[^A-Z0-9]/ig, '')!.toLocaleLowerCase()!) > -1 &&
                                        request.userPreferences![aggregate.groupBy!]!.
                                        indexOf(b.name!.replace(/[^A-Z0-9]/ig, '')!.toLocaleLowerCase()) > -1
                                    ) { return a.name!.localeCompare(b.name!); }
                                    if (request.userPreferences![aggregate.groupBy!]!.
                                        indexOf(a.name!.replace(/[^A-Z0-9]/ig, '')!.toLocaleLowerCase()) > -1) {
                                         return -1;
                                        }
                                    if (request.userPreferences![aggregate.groupBy!]!.
                                        indexOf(b.name!.replace(/[^A-Z0-9]/ig, '')!.toLocaleLowerCase()) > -1) {
                                         return 1;
                                        }
                                    return 0;
                                });
                            }
                            if (d.name) {
                                let facetDet = onlineContentsResponse.filterCriteria.facetFilters || []
                                facetDet.map((facet) => {
                                    let facetVal = (facet.name == d.name) ? facet.values : [];
                                    return d.sections.filter((o1) => {
                                        return facetVal.some((o2) => {
                                            if ((o1.name)!.toLocaleLowerCase() === (o2.name)!.toLowerCase()) {
                                                o1.totalCount = o2.count;
                                            }
                                            return o1.name === o2.name;          
                                        });
                                    })
                                })
                            }
                            return d;
                        })();
                        return {
                            index: section.index,
                            title: section.title,
                            meta: {
                                searchCriteria,
                                filterCriteria: onlineContentsResponse.filterCriteria,
                                searchRequest
                            },
                            data,
                            dataSrc: field.dataSrc,
                            theme: section.theme,
                            description: section.description,
                            landingDetails: section.landingDetails,
                            isEnabled: section.isEnabled
                        } as ContentAggregation<'CONTENTS'>;
                    }
                });
            })
        };
    }

    private buildFilterByCriteria<T>(config: {
        [field in keyof T]: {
            operation: any,
            value: any
        }
    }[]): CsFilterCriteria<T>[] {
        return config.reduce((agg, s) => {
            Object.keys(s).forEach((k) => agg.push({
                filterAttribute: k as any,
                filterCondition: {
                    operation: s[k].operation,
                    value: s[k].value
                }
            }));
            return agg;
        }, [] as CsFilterCriteria<T>[]);
    }

    private buildSortByCriteria<T>(config: {
        [field in keyof T]: 'asc' | 'desc' | { order: 'asc' | 'desc', preference: Primitive[] }
    }[]): CsSortCriteria<T>[] {
        return config.reduce((agg, s) => {
            Object.keys(s).forEach((k) => agg.push({
                sortAttribute: k as any,
                sortOrder: s[k],
            }));
            return agg;
        }, [] as CsSortCriteria<T>[]);
    }

    private buildSearchRequestAndCriteria(field: AggregatorConfigField<'CONTENTS' | 'CONTENT_FACETS'>, request: ContentAggregatorRequest) {
        const buildSearchCriteriaFromSearchRequest: (r) => ContentSearchCriteria = (r) => {
            return this.searchContentHandler.getSearchCriteria(r);
        };

        const buildSearchRequestFromSearchCriteria: (criteria) => SearchRequest = (c) => {
            return this.searchContentHandler.getSearchContentRequest(c);
        };

        const tempSearchRequest: SearchRequest = (() => {
            if (field.dataSrc.request && field.dataSrc.request.body) {
                return { filters: {}, ...(field.dataSrc.request.body as any).request };
            } else {
                return { filters: {} };
            }
        })();

        const tempSearchCriteria: ContentSearchCriteria = (() => {
            if (request.interceptSearchCriteria) {
                return request.interceptSearchCriteria(buildSearchCriteriaFromSearchRequest({
                    request: tempSearchRequest
                }));
            } else {
                return buildSearchCriteriaFromSearchRequest({
                    request: tempSearchRequest
                });
            }
        })();

        return {
            searchRequest: buildSearchRequestFromSearchCriteria(tempSearchCriteria),
            searchCriteria: tempSearchCriteria
        };
    }

    private searchContents(
        field: AggregatorConfigField<'CONTENTS' | 'CONTENT_FACETS'>, searchCriteria: ContentSearchCriteria, searchRequest: SearchRequest
    ): Promise<ContentSearchResult> {
        const apiService = this.apiService;
        return this.contentService.searchContent(
            searchCriteria,
            undefined,
            new class implements ApiRequestHandler<SearchRequest, SearchResponse> {
                handle(_: SearchRequest): Observable<SearchResponse> {
                    if (searchRequest && searchRequest.filters && searchRequest.filters.mimeType) {
                        const reducer = (acc, cur) => {
                            if (MimeTypeCategoryMapping[cur]) {
                                return acc.concat(MimeTypeCategoryMapping[cur])
                            }
                            return acc.concat([cur])
                        };
                        searchRequest.filters.mimeType = searchRequest.filters.mimeType.reduce(reducer, []);
                    }
                    if (field.dataSrc.request && field.dataSrc.request.body && (field.dataSrc.request.body as any).request) {
                        field.dataSrc.request.body = {
                            request: {
                                ...(field.dataSrc.request.body as any).request,
                                ...searchRequest
                            }
                        } as any;
                    } else {
                        field.dataSrc.request.body = {
                            request: searchRequest
                        } as any;
                    }
                    const cacheKey = JSON.stringify(ObjectUtil.withDeeplyOrderedKeys(field.dataSrc.request));

                    if (ContentAggregator.searchContentCache.has(cacheKey)) {
                        return of(ContentAggregator.searchContentCache.get(cacheKey)!).pipe(
                            map((success) => {
                                return success.body;
                            })
                        );
                    }

                    const apiRequest = Request.fromJSON(field.dataSrc.request);
                    return apiService.fetch<SearchResponse>(apiRequest).pipe(
                        tap((r) => {
                            ContentAggregator.searchContentCache.set(cacheKey, r);
                        }),
                        map((success) => {
                            return success.body;
                        })
                    );
                }
            }, true).pipe(
            catchError((e) => {
                console.error(e);

                return of({
                    id: 'OFFLINE_RESPONSE_ID',
                    responseMessageId: 'OFFLINE_RESPONSE_ID',
                    filterCriteria: searchCriteria,
                    contentDataList: []
                });
            })
        ).toPromise();
    }
}
