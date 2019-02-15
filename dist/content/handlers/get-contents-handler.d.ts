import { ContentRequest } from '..';
export declare class GetContentsHandler {
    getAllLocalContentQuery(request: ContentRequest): string;
    private getRecentlyViewedQuery;
    private getLocalOnlyQuery;
    private generateSortByQuery;
    private generateOrderByQuery;
}
