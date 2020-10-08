import {
    Content,
    ContentAggregatorRequest,
    ContentAggregatorResponse,
    ContentData,
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

interface LibraryConfigFormField {
    index: number;
    title: string;
    isEnabled: boolean;
    groupBy: keyof ContentData;
    orientation: 'horizontal' | 'vertical';
    applyFirstAvailableCombination: boolean;
    sortBy: {
        [field: string]: 'asc' | 'desc'
    }[];
    search: SearchRequest;
    dataSrc?: 'CONTENTS' | 'TRACKABLE_CONTENTS' | 'TRACKABLE_COURSE_CONTENTS';
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
        };
        return SHA1(JSON.stringify(key)).toString();
    }

    aggregate(
        request: ContentAggregatorRequest,
        dataSrc: ('CONTENTS' | 'TRACKABLE_CONTENTS' | 'TRACKABLE_COURSE_CONTENTS' | undefined)[],
        formRequest: FormRequest
    ): Observable<ContentAggregatorResponse> {
        return defer(async () => {
            let fields: LibraryConfigFormField[] = await this.formService.getForm(
                formRequest
            ).toPromise().then((r) => r.form.data.fields);

            fields = fields.filter((field) => field.isEnabled && dataSrc.indexOf(field.dataSrc || 'CONTENTS') >= 0)
                .sort((a, b) => a.index - b.index);

            const fieldTasks = fields.map(async (field) => {
                switch (field.dataSrc) {
                    default:
                    case 'CONTENTS':
                        return await this.buildContentSearchTask(field, request);
                    case 'TRACKABLE_CONTENTS':
                        return await this.buildTrackableTask(field, request, (c) => c.content.primaryCategory.toLowerCase() !== 'course');
                    case 'TRACKABLE_COURSE_CONTENTS':
                        return await this.buildTrackableTask(field, request, (c) => c.content.primaryCategory.toLowerCase() === 'course');
                }
            });

            return {
                result: await Promise.all<{
                    title: string;
                    orientation: 'horizontal' | 'vertical';
                    section: ContentsGroupedByPageSection;
                    searchRequest?: SearchRequest;
                    searchCriteria?: ContentSearchCriteria;
                }>(fieldTasks)
            };
        });
    }

    private async buildTrackableTask(field: LibraryConfigFormField, request: ContentAggregatorRequest, filter): Promise<{
        title: string;
        orientation: 'horizontal' | 'vertical';
        section: ContentsGroupedByPageSection;
        searchRequest?: SearchRequest;
        searchCriteria?: ContentSearchCriteria;
    }> {
        const session = await this.profileService.getActiveProfileSession().toPromise();
        const courses = await this.courseService.getEnrolledCourses({
            userId: session.managedSession ? session.managedSession.uid : session.uid,
            returnFreshCourses: true
        }).toPromise();

        const contents = courses.filter((c) => filter(c));

        return {
            title: field.title,
            orientation: field.orientation,
            section: {
                name: field.index + '',
                sections: [
                    {
                        count: contents.length,
                        contents
                    }
                ]
            }
        };
    }

    private async buildContentSearchTask(field: LibraryConfigFormField, request: ContentAggregatorRequest): Promise<{
        title: string;
        orientation: 'horizontal' | 'vertical';
        section: ContentsGroupedByPageSection;
        searchRequest: SearchRequest;
        searchCriteria: ContentSearchCriteria;
    }> {
        let searchCriteria: ContentSearchCriteria = this.buildSearchCriteriaFromSearchRequest({request: field.search});

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

        if (!field.groupBy) {
            return {
                title: field.title,
                orientation: field.orientation,
                searchCriteria,
                searchRequest: this.buildSearchRequestFromSearchCriteria(searchCriteria),
                section: {
                    name: field.index + '',
                    sections: [
                        {
                            count: combinedContents.length,
                            contents: combinedContents
                        }
                    ]
                }
            };
        } else {
            return {
                title: field.title,
                orientation: field.orientation,
                searchCriteria,
                searchRequest: this.buildSearchRequestFromSearchCriteria(searchCriteria),
                section: CsContentsGroupGenerator.generate(
                    combinedContents,
                    field.groupBy,
                    field.sortBy.reduce((agg, s) => {
                        Object.keys(s).forEach((k) => agg.push({
                            sortAttribute: k,
                            sortOrder: s[k] === 'asc' ? CsSortOrder.ASC : CsSortOrder.DESC,
                        }));
                        return agg;
                    }, [] as CsContentSortCriteria[]),
                    field.applyFirstAvailableCombination && request.applyFirstAvailableCombination as any,
                )
            };
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
        return this.cachedItemStore[from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            ContentAggregator.getIdForDb(searchCriteria),
            ContentAggregator.SEARCH_CONTENT_GROUPED_KEY,
            'ttl_' + ContentAggregator.SEARCH_CONTENT_GROUPED_KEY,
            () => this.contentService.searchContent(searchCriteria),
            undefined,
            undefined,
            (contentSearchResult: ContentSearchResult) =>
                !contentSearchResult ||
                !contentSearchResult.contentDataList ||
                contentSearchResult.contentDataList.length === 0
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
