import {
    Content,
    ContentAggregatorRequest,
    ContentAggregatorResponse,
    ContentData, ContentRequest,
    ContentSearchCriteria,
    ContentSearchResult,
    ContentService,
    ContentsGroupedByPageSection,
} from '..';
import {defer, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as SHA1 from 'crypto-js/sha1';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {SearchRequest} from '../def/search-request';
import {FormRequest, FormService} from '../../form';
import {SearchContentHandler} from './search-content-handler';
import {CsContentSortCriteria, CsSortOrder} from '@project-sunbird/client-services/services/content';
import {CsContentsGroupGenerator} from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import {CourseService} from '../../course';
import {ProfileService} from '../../profile';

export interface DataSourceMap {
    'TRACKABLE_COURSE_CONTENTS': {
        name: 'TRACKABLE_COURSE_CONTENTS'
    };
    'TRACKABLE_CONTENTS': {
        name: 'TRACKABLE_CONTENTS'
    };
    'CONTENT_FACETS': {
        name: 'CONTENT_FACETS',
        facet: string,
        aggregate: {
            sortBy?: {
                [field in keyof ContentData]: 'asc' | 'desc'
            }[];
            groupBy?: keyof ContentData;
        }
    };
    'RECENTLY_VIEWED_CONTENTS': {
        name: 'RECENTLY_VIEWED_CONTENTS'
    };
    'CONTENTS': {
        name: 'CONTENTS',
        aggregate: {
            sortBy?: {
                [field in keyof ContentData]: 'asc' | 'desc'
            }[];
            groupBy?: keyof ContentData;
        }
    };
}

export interface DataResponseMap {
    'TRACKABLE_COURSE_CONTENTS': ContentsGroupedByPageSection;
    'TRACKABLE_CONTENTS': ContentsGroupedByPageSection;
    'CONTENT_FACETS': {
        facet: string;
        searchCriteria: ContentSearchCriteria;
        aggregate: {
            sortBy?: {
                [field in keyof ContentData]: 'asc' | 'desc'
            }[];
            groupBy?: keyof ContentData;
        }
    }[];
    'RECENTLY_VIEWED_CONTENTS': ContentsGroupedByPageSection;
    'CONTENTS': ContentsGroupedByPageSection;
}

export type DataSourceType = keyof DataSourceMap;

interface AggregatorConfigField<T extends DataSourceType = any> {
    index: number;
    title: string;
    isEnabled: boolean;
    dataSrc: DataSourceMap[T];
    searchRequest?: SearchRequest;
    theme: any;
}

export interface ContentAggregation<T extends DataSourceType = any> {
    title: string;
    data: DataResponseMap[T];
    dataSrc: DataSourceMap[T];
    searchRequest?: SearchRequest;
    searchCriteria?: ContentSearchCriteria;
    theme: any;
}

export class ContentAggregator {
    private static readonly SEARCH_CONTENT_GROUPED_KEY = 'search_content_grouped';

    constructor(
        private searchContentHandler: SearchContentHandler,
        private formService: FormService,
        private contentService: ContentService,
        private cachedItemStore: CachedItemStore,
        private courseService: CourseService,
        private profileService: ProfileService
    ) {
    }

    private static getIdForDb(request: ContentSearchCriteria): string {
        const key = {
            framework: request.framework || '',
            primaryCategory: request.primaryCategories || '',
            board: request.board || '',
            medium: request.medium || '',
            grade: request.grade || '',
            ...(request.purpose && request.purpose.length ? {purpose: request.purpose} : {}),
            ...(request.channel && request.channel.length ? {channel: request.channel} : {}),
            ...(request.subject && request.subject.length ? {subject: request.subject} : {}),
            ...(request.topic && request.topic.length ? {topic: request.topic} : {})
        };
        return SHA1(JSON.stringify(key)).toString();
    }

    aggregate(
        request: ContentAggregatorRequest,
        filterDataSrc: DataSourceType[],
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
                .filter((field) => field.isEnabled && filterDataSrc.indexOf(field.dataSrc.name) >= 0)
                .sort((a, b) => a.index - b.index);

            const fieldTasks = fields.map(async (field) => {
                switch (field.dataSrc.name) {
                    case 'CONTENT_FACETS':
                        return await this.buildFacetsTask(field, request);
                    case 'RECENTLY_VIEWED_CONTENTS':
                        return await this.buildRecentlyViewedTask(field, request);
                    case 'CONTENTS':
                        return await this.buildContentSearchTask(field, request);
                    case 'TRACKABLE_CONTENTS':
                        return await this.buildTrackableTask(field, request, (c) => c.content.primaryCategory.toLowerCase() !== 'course');
                    case 'TRACKABLE_COURSE_CONTENTS':
                        return await this.buildTrackableTask(field, request, (c) => c.content.primaryCategory.toLowerCase() === 'course');
                    default:
                        return await this.buildContentSearchTask(field, request);
                }
            });

            return {
                result: await Promise.all<ContentAggregation>(fieldTasks)
            };
        });
    }

    private async buildRecentlyViewedTask(
        field: AggregatorConfigField<'RECENTLY_VIEWED_CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'RECENTLY_VIEWED_CONTENTS'>> {
        const profile = await this.profileService.getActiveProfileSession().toPromise();

        const requestParams: ContentRequest = {
          uid: profile ? profile.uid : undefined,
          primaryCategories: [],
          recentlyViewed: true,
          limit: 20
        };

        const contents = await this.contentService.getContents(requestParams).toPromise();

        return {
            title: field.title,
            data: {
                name: field.index + '',
                sections: [
                    {
                        name: field.index + '',
                        count: contents.length,
                        contents
                    }
                ]
            },
            dataSrc: field.dataSrc,
            theme: field.theme
        } as ContentAggregation<'RECENTLY_VIEWED_CONTENTS'>;
    }

    private async buildFacetsTask(
        field: AggregatorConfigField<'CONTENT_FACETS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'CONTENT_FACETS'>> {
        let searchCriteria: ContentSearchCriteria = {
            offset: 0,
            limit: 0,
            mode: 'hard',
            facets: [
                field.dataSrc.facet
            ],
        };

        if (request.interceptSearchCriteria) {
            const impliedSearchCriteria = request.interceptSearchCriteria(searchCriteria);
            searchCriteria = {
                ...impliedSearchCriteria, ...searchCriteria
            };
        }

        const searchResult = await this.fetchOnlineContents(searchCriteria);
        const facetFilters = searchResult.filterCriteria.facetFilters!.find((x) => x.name === field.dataSrc.facet);

        if (facetFilters) {
            return {
                title: field.title,
                data: facetFilters.values.map((filterValue) => {
                    return {
                        facet: filterValue.name,
                        searchCriteria: {
                            ...searchCriteria,
                            [facetFilters.name]: [filterValue.name]
                        },
                        aggregate: field.dataSrc['aggregate']
                    };
                }),
                dataSrc: field.dataSrc,
                theme: field.theme
            };
        }

        return {
            title: field.title,
            data: [],
            dataSrc: field.dataSrc,
            theme: field.theme
        };
    }

    private async buildTrackableTask(
        field: AggregatorConfigField<'TRACKABLE_CONTENTS'>,
        request: ContentAggregatorRequest,
        filter
    ): Promise<ContentAggregation<'TRACKABLE_CONTENTS'>> {
        const session = await this.profileService.getActiveProfileSession().toPromise();
        const courses = await this.courseService.getEnrolledCourses({
            userId: session.managedSession ? session.managedSession.uid : session.uid,
            returnFreshCourses: true
        }).toPromise();

        const contents = courses.filter((c) => filter(c));

        return {
            title: field.title,
            data: {
                name: field.index + '',
                sections: [
                    {
                        name: field.index + '',
                        count: contents.length,
                        contents
                    }
                ]
            },
            dataSrc: field.dataSrc,
            theme: field.theme
        } as ContentAggregation<'TRACKABLE_CONTENTS'>;
    }

    private async buildContentSearchTask(
        field: AggregatorConfigField<'CONTENTS'>,
        request: ContentAggregatorRequest
    ): Promise<ContentAggregation<'CONTENTS'>> {
        if (!field.searchRequest) {
            throw new Error('Expected field.searchRequest for dataSrc.name = "TRACKABLE_CONTENTS"');
        }
        let searchCriteria: ContentSearchCriteria = this.buildSearchCriteriaFromSearchRequest({
            request: field.searchRequest
        });

        if (request.interceptSearchCriteria) {
            searchCriteria = request.interceptSearchCriteria(searchCriteria);
        }

        const offlineSearchContentDataList: ContentData[] = await this.fetchOfflineContents(searchCriteria);
        const onlineSearchContentDataList: ContentData[] = (
            (await this.fetchOnlineContents(searchCriteria, request.from)).contentDataList as ContentData[] || []
        ).filter((contentData) => {
            return !offlineSearchContentDataList.find(
                (localContentData) => localContentData.identifier === contentData.identifier);
        });
        const combinedContents: ContentData[] = offlineSearchContentDataList.concat(onlineSearchContentDataList);

        if (!field.dataSrc.aggregate.groupBy) {
            return {
                title: field.title,
                searchCriteria,
                searchRequest: this.buildSearchRequestFromSearchCriteria(searchCriteria),
                data: {
                    name: field.index + '',
                    sections: [
                        {
                            count: combinedContents.length,
                            contents: combinedContents
                        }
                    ]
                },
                dataSrc: field.dataSrc,
                theme: field.theme
            } as ContentAggregation<'CONTENTS'>;
        } else {
            return {
                title: field.title,
                searchCriteria,
                searchRequest: this.buildSearchRequestFromSearchCriteria(searchCriteria),
                data: CsContentsGroupGenerator.generate(
                    combinedContents,
                    field.dataSrc.aggregate.groupBy,
                    field.dataSrc.aggregate.sortBy ?
                    field.dataSrc.aggregate.sortBy.reduce((agg, s) => {
                        Object.keys(s).forEach((k) => agg.push({
                            sortAttribute: k,
                            sortOrder: s[k] === 'asc' ? CsSortOrder.ASC : CsSortOrder.DESC,
                        }));
                        return agg;
                    }, [] as CsContentSortCriteria[]) : []
                ),
                dataSrc: field.dataSrc,
                theme: field.theme
            } as ContentAggregation<'CONTENTS'>;
        }
    }

    private buildSearchCriteriaFromSearchRequest(request): ContentSearchCriteria {
        return this.searchContentHandler.getSearchCriteria(request);
    }

    private buildSearchRequestFromSearchCriteria(criteria): SearchRequest {
        return this.searchContentHandler.getSearchContentRequest(criteria);
    }

    private async fetchOfflineContents(searchRequest: ContentSearchCriteria): Promise<ContentData[]> {
        return this.contentService.getContents({
            primaryCategories: searchRequest.primaryCategories || [],
            board: searchRequest.board,
            medium: searchRequest.medium,
            grade: searchRequest.grade
        }).pipe(
            map((contents: Content[]) => contents.map((content) => {
                if (content.contentData.appIcon && !content.contentData.appIcon.startsWith('https://')) {
                    content.contentData.appIcon = content.basePath + content.contentData.appIcon;
                }
                return content.contentData;
            }))
        ).toPromise();
    }

    private async fetchOnlineContents(
        searchCriteria: ContentSearchCriteria, from?: CachedItemRequestSourceFrom
    ): Promise<ContentSearchResult> {
        return this.contentService.searchContent(searchCriteria).pipe(
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
