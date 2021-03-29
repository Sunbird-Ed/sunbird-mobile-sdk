import {map} from 'rxjs/operators';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Content, ContentData, ContentDetailRequest, ContentServiceConfig} from '..';

export class GetContentHeirarchyHandler implements ApiRequestHandler<ContentDetailRequest, Content> {
    private readonly GET_CONTENT_HEIRARCHY_ENDPOINT = '/hierarchy';

    constructor(private apiService: ApiService, private contentServiceConfig: ContentServiceConfig) {
    }

    handle(request: ContentDetailRequest) {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.contentServiceConfig.contentHeirarchyAPIPath + this.GET_CONTENT_HEIRARCHY_ENDPOINT + '/' + request.contentId)
            .withBearerToken(true)
            .build();
        return this.apiService.fetch<{ result: { content: ContentData } }>(apiRequest)
            .pipe(
                map((response) => {
                    return this.mapContentFromContentHeirarchyData(response.body.result.content);
                })
            );
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

