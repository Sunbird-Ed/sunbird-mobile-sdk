import { ContentRequest } from '..';
export declare class GetContentsHandler {
    getAllLocalContentQuery(request: ContentRequest): string;
    private getAudienceFilter;
    private getPragmaFilter;
    private getRecentlyViewedQuery;
    private getLocalOnlyQuery;
    private generateSortByQuery;
    private generateOrderByQuery;
    private generateFieldMatchQuery;
    private generateLikeQuery;
}
