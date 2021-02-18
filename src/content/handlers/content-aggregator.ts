import {
    Content,
    ContentAggregatorRequest,
    ContentAggregatorResponse,
    ContentData, ContentRequest,
    ContentSearchCriteria, ContentSearchResult,
    ContentService,
    ContentsGroupedByPageSection, SearchResponse,
} from '..';
import {defer, Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {CachedItemStore} from '../../key-value-store';
import {SearchRequest} from '../def/search-request';
import {FormRequest, FormService} from '../../form';
import {SearchContentHandler} from './search-content-handler';
import {CsContentSortCriteria, CsSortOrder, CsContentFilterCriteria} from '@project-sunbird/client-services/services/content';
import {CsContentsGroupGenerator} from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import {CourseService} from '../../course';
import {ProfileService} from '../../profile';
import {ApiRequestHandler, ApiService, Request, SerializedRequest} from '../../api';
import {GetEnrolledCourseResponse} from '../../course/def/get-enrolled-course-response';
import {CsResponse} from '@project-sunbird/client-services/core/http-service';
import {ObjectUtil} from '../../util/object-util';

interface AggregationConfig {
    filterBy?: {
        [field in keyof ContentData]: {
            operation: any,
            value: any
        }
    }[];
    sortBy?: {
        [field in keyof ContentData]: 'asc' | 'desc'
    }[];
    groupBy?: keyof ContentData;
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
            aggregate?: AggregationConfig
        }[]
    };
    'RECENTLY_VIEWED_CONTENTS': {
        type: 'RECENTLY_VIEWED_CONTENTS',
        tag?: string,
        mapping: {
            aggregate?: AggregationConfig
        }[]
    };
}

export interface DataResponseMap {
    'TRACKABLE_COLLECTIONS': ContentsGroupedByPageSection;
    'CONTENT_FACETS': {
        facet: string;
        searchCriteria: ContentSearchCriteria;
        primaryFacetFilters?: any;
        aggregate?: AggregationConfig
    }[];
    'RECENTLY_VIEWED_CONTENTS': ContentsGroupedByPageSection;
    'CONTENTS': ContentsGroupedByPageSection;
}

export type DataSourceType = keyof DataSourceModelMap;

export interface AggregatorConfigField<T extends DataSourceType = any> {
    dataSrc: DataSourceModelMap[T];
    sections: {
        index: number;
        title: string;
        theme: any;
    }[];
}

export interface ContentAggregation<T extends DataSourceType = any> {
    index: number;
    title: string;
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

    constructor(
        private searchContentHandler: SearchContentHandler,
        private formService: FormService,
        private contentService: ContentService,
        private cachedItemStore: CachedItemStore,
        private courseService: CourseService,
        private profileService: ProfileService,
        private apiService: ApiService
    ) {
    }

    aggregate(
        request: ContentAggregatorRequest,
        excludeDataSrc: DataSourceType[],
        formRequest?: FormRequest,
        formFields?: AggregatorConfigField[]
    ): Observable<ContentAggregatorResponse> {
        return defer(async () => {
            if (!formRequest && !formFields) {
                throw new Error('formRequest or formFields required');
            }

            let fields: AggregatorConfigField[] = [];
            if (formRequest) {
                fields = await this.formService.getForm(
                    formRequest
                ).toPromise().then((r) => r.form.data.fields);
            } else if (formFields) {
                fields = formFields;
            }

            fields = fields
                .filter((field) => excludeDataSrc.indexOf(field.dataSrc.type) === -1);

            const fieldTasks: Promise<ContentAggregation[]>[] = fields.map(async (field) => {
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
                    default: {
                        console.error('UNKNOWN_DATA_SRC');
                        return [];
                    }
                }
            });

            return {
                result: await Promise.all(fieldTasks).then((result: ContentAggregation[][]) => {
                    return result
                        .reduce<ContentAggregation[]>((acc, v) => {
                            return [...acc, ...v];
                        }, [])
                        .sort((a, b) => a.index - b.index);
                })
            };
        });
    }

    private async buildRecentlyViewedTask(
        field: AggregatorConfigField<'RECENTLY_VIEWED_CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'RECENTLY_VIEWED_CONTENTS'>[]> {
        const profile = await this.profileService.getActiveProfileSession().toPromise();

        const requestParams: ContentRequest = {
            uid: profile ? profile.uid : undefined,
            primaryCategories: [],
            recentlyViewed: true,
            limit: 20
        };

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
                theme: section.theme
            } as ContentAggregation<'RECENTLY_VIEWED_CONTENTS'>;
        });
    }

    private async buildFacetsTask(
        field: AggregatorConfigField<'CONTENT_FACETS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'CONTENT_FACETS'>[]> {
        if (field.dataSrc.values) {
            return field.sections.map((section) => {
                return {
                    index: section.index,
                    title: section.title,
                    data: field.dataSrc.values as any,
                    dataSrc: field.dataSrc,
                    theme: section.theme
                };
            });
        }

        const { searchRequest, searchCriteria } = this.buildSearchRequestAndCriteria(field, request);

        searchCriteria.facets = field.dataSrc.mapping.map((m) => m.facet);
        searchRequest.facets = searchCriteria.facets;
        searchRequest.limit = 0;
        searchRequest.offset = 0;

        const searchResult = await this.searchContents(field, searchCriteria, searchRequest);

        return field.sections.map((section, index) => {
            const facetFilters = searchResult.filterCriteria.facetFilters && searchResult.filterCriteria.facetFilters.find((x) =>
                x.name === (field.dataSrc.mapping[index] && field.dataSrc.mapping[index].facet)
            );

            if (facetFilters) {
                return {
                    index: section.index,
                    title: section.title,
                    data: facetFilters.values.map((filterValue) => {
                        return {
                            facet: filterValue.name,
                            searchCriteria: {
                                ...searchCriteria,
                                [facetFilters.name]: [filterValue.name]
                            },
                            aggregate: field.dataSrc.mapping[index].aggregate
                        };
                    }).sort((a, b) => {
                        // if (request.userPreferences && request.userPreferences[facetFilters.name]) {
                        //     const facetPreferences = request.userPreferences[facetFilters.name];
                        //   if (facetPreferences === a.facet) {
                        //       return 1;
                        //   } else if (Array.isArray(facetPreferences) && ) {

                        //   }
                        // }
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
                    theme: section.theme
                };
            } else {
                return {
                    index: section.index,
                    title: section.title,
                    data: [],
                    dataSrc: field.dataSrc,
                    theme: section.theme
                };
            }
        });
    }

    private async buildTrackableCollectionsTask(
        field: AggregatorConfigField<'TRACKABLE_COLLECTIONS'>,
        request: ContentAggregatorRequest,
    ): Promise<ContentAggregation<'TRACKABLE_COLLECTIONS'>[]> {
        const apiService = this.apiService;
        const session = await this.profileService.getActiveProfileSession().toPromise();
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
                    theme: section.theme
                };
            } else {
                const aggregate = field.dataSrc.mapping[index].aggregate!;
                return {
                    index: section.index,
                    title: section.title,
                    data: CsContentsGroupGenerator.generate({
                        contents: courses as any,
                        groupBy: aggregate.groupBy!,
                        sortCriteria: aggregate.sortBy ? this.buildSortByCriteria(aggregate.sortBy) : [],
                        filterCriteria: aggregate.filterBy ? this.buildFilterByCriteria(aggregate.filterBy) : [],
                        includeSearchable: false
                    }),
                    dataSrc: field.dataSrc,
                    theme: section.theme
                } as ContentAggregation<'TRACKABLE_COLLECTIONS'>;
            }
        });
    }

    private async buildContentSearchTask(
        field: AggregatorConfigField<'CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'CONTENTS'>[]> {
        const { searchRequest, searchCriteria } = this.buildSearchRequestAndCriteria(field, request);

        const offlineSearchContentDataList: ContentData[] = await (/* fetch offline contents */ async () => {
            return this.contentService.getContents({
                primaryCategories: searchCriteria.primaryCategories || [],
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
                    theme: section.theme
                } as ContentAggregation<'CONTENTS'>;
            } else {
                const aggregate = field.dataSrc.mapping[index].aggregate!;
                return {
                    index: section.index,
                    title: section.title,
                    meta: {
                        searchCriteria,
                        filterCriteria: onlineContentsResponse.filterCriteria,
                        searchRequest
                    },
                    data: CsContentsGroupGenerator.generate({
                        contents: combinedContents,
                        groupBy: aggregate.groupBy!,
                        sortCriteria: aggregate.sortBy ? this.buildSortByCriteria(aggregate.sortBy) : [],
                        filterCriteria: aggregate.filterBy ? this.buildFilterByCriteria(aggregate.filterBy) : [],
                        combination: field.dataSrc.mapping[index].applyFirstAvailableCombination &&
                            request.applyFirstAvailableCombination as any,
                        includeSearchable: false
                    }),
                    dataSrc: field.dataSrc,
                    theme: section.theme
                } as ContentAggregation<'CONTENTS'>;
            }
        });
    }

    private buildFilterByCriteria(config: {
        [field in keyof ContentData]: {
            operation: any,
            value: any
        }
    }[]): CsContentFilterCriteria[] {
        return config.reduce((agg, s) => {
            Object.keys(s).forEach((k) => agg.push({
                filterAttribute: k,
                filterCondition: {
                    operation: s[k].operation,
                    value: s[k].value
                }
            }));
            return agg;
        }, [] as CsContentFilterCriteria[]);
    }

    private buildSortByCriteria(config: {
        [field in keyof ContentData]: 'asc' | 'desc'
    }[]): CsContentSortCriteria[] {
        return config.reduce((agg, s) => {
            Object.keys(s).forEach((k) => agg.push({
                sortAttribute: k,
                sortOrder: s[k] === 'asc' ? CsSortOrder.ASC : CsSortOrder.DESC,
            }));
            return agg;
        }, [] as CsContentSortCriteria[]);
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
            }
        ).pipe(
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
