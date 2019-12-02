import { ApiRequestHandler, ApiService } from '../../api';
import { Content, ContentDetailRequest, ContentServiceConfig } from '..';
export declare class GetContentHeirarchyHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private apiService;
    private contentServiceConfig;
    private readonly GET_CONTENT_HEIRARCHY_ENDPOINT;
    constructor(apiService: ApiService, contentServiceConfig: ContentServiceConfig);
    handle(request: ContentDetailRequest): import("../../../node_modules/rxjs/internal/Observable").Observable<any>;
    private mapContentFromContentHeirarchyData;
}
