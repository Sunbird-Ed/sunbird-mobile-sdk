import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {
    Content,
    ContentDetailRequest,
    ContentServiceConfig,
} from '..';

export class GetContentHeirarchyHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly GET_CONTENT_HEIRARCHY_ENDPOINT = '/hierarchy';

    constructor(private apiService: ApiService, private contentServiceConfig: ContentServiceConfig) {
    }

    handle(request: ContentDetailRequest) {
        console.log('in getContentHeirarchyFromServer');
        const getContentHeirarchyEndPoint = '/api/course/v1/hierarchy';
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.contentServiceConfig.contentHeirarchyAPIPath + this.GET_CONTENT_HEIRARCHY_ENDPOINT + '/' + request.contentId)
            .withApiToken(true)
            .build();
        console.time('getContentHeirarchyFromServer');
        return this.apiService.fetch<{ result: any }>(apiRequest)
            .map((response) => {
                console.timeEnd('getContentHeirarchyFromServer');
                return this.mapContentFromContentHeirarchyData(response.body.result.content);
            });
    }

    private mapContentFromContentHeirarchyData(serverContentData) {
            serverContentData['contentData'] = {...serverContentData};
            if (serverContentData['children'] && serverContentData['children'].length) {
                serverContentData['children'] = serverContentData['children'].map((childContent) => {
                    return this.mapContentFromContentHeirarchyData({...childContent});
                });
            }
            return serverContentData;
    }
}

