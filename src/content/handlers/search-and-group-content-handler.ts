import {
    Content,
    ContentData,
    ContentSearchCriteria,
    ContentSearchResult,
    ContentService,
    ContentsGroupedByPageSection,
    SearchAndGroupContentRequest,
    SortOrder
} from '..';
import {defer, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as SHA1 from 'crypto-js/sha1';
import {CachedItemStore} from '../../key-value-store';
import {ContentsGroupGenerator} from './contents-group-generator';

export class SearchAndGroupContentHandler {
    private static readonly SEARCH_CONTENT_GROUPED_KEY = 'search_content_grouped';

    constructor(
        private contentService: ContentService,
        private cachedItemStore: CachedItemStore
    ) {
    }

    private static getIdForDb(request: ContentSearchCriteria): string {
        const key = {
            framework: request.framework || '',
            contentType: request.contentTypes || '',
            board: request.board || '',
            medium: request.medium || '',
            grade: request.grade || '',
        };
        return SHA1(JSON.stringify(key)).toString();
    }

    handle(request: SearchAndGroupContentRequest): Observable<ContentsGroupedByPageSection> {
        return defer(async () => {
            const localTextBooksContentDataList = await this.fetchOfflineContent(request.searchCriteria);
            const searchContentDataList = ((await this.fetchOnlineContent(request.searchCriteria)).contentDataList as ContentData[] || [])
                .filter((contentData) => {
                    return !localTextBooksContentDataList.find(
                        (localContentData) => localContentData.identifier === contentData.identifier);
                });

            const combinedContents: ContentData[] = localTextBooksContentDataList.concat(searchContentDataList);

            return ContentsGroupGenerator.generate(
                combinedContents,
                {
                    groupBy: request.groupBy,
                    combination: request.combination,
                    sortCriteria: (request.searchCriteria.sortCriteria && request.searchCriteria.sortCriteria[0]) || {
                        sortAttribute: 'name',
                        sortOrder: SortOrder.ASC,
                    }
                },
            );
        });
    }

    private async fetchOfflineContent(searchRequest: ContentSearchCriteria): Promise<ContentData[]> {
        return this.contentService.getContents({
            contentTypes: searchRequest.contentTypes || [],
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

    private async fetchOnlineContent(searchRequest: ContentSearchCriteria): Promise<ContentSearchResult> {
        return this.cachedItemStore.getCached(
            SearchAndGroupContentHandler.getIdForDb(searchRequest),
            SearchAndGroupContentHandler.SEARCH_CONTENT_GROUPED_KEY,
            'ttl_' + SearchAndGroupContentHandler.SEARCH_CONTENT_GROUPED_KEY,
            () => this.contentService.searchContent(searchRequest),
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
                    filterCriteria: searchRequest,
                    contentDataList: []
                });
            })
        ).toPromise();
    }
}
