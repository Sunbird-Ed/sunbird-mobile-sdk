import {ApiService, HttpRequestType, Request} from '../../api';
import {CourseServiceConfig, GetContentStateRequest} from '..';
import {defer, iif, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ContentService} from '../../content';

export class GetContentStateHandler {
    private readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    private readonly GET_CONTENT_STATE_ENDPOINT = '/content/state/read';

    constructor(
        private apiService: ApiService,
        private courseServiceConfig: CourseServiceConfig,
        private contentService: ContentService
    ) {
    }

    public handle(contentStateRequest: GetContentStateRequest): Observable<any> {
        delete contentStateRequest['returnRefreshedContentStates'];

        return iif(
            () => !contentStateRequest.contentIds || !contentStateRequest.contentIds.length,
            defer(async () => {
                contentStateRequest.contentIds = await (async () => {
                    if (contentStateRequest.courseId) {
                        const content = await this.contentService.getContentDetails({
                            contentId: contentStateRequest.courseId
                        }).toPromise();
                        return content.contentData['leafNodes'] || [];
                    } else if (contentStateRequest.courseIds) {
                        const contents = await Promise.all(
                            contentStateRequest.courseIds.map((courseId) => this.contentService.getContentDetails({
                                contentId: courseId
                            }).toPromise())
                        );

                        return contents.reduce<string[]>((agg, c) => {
                            agg = [...agg, ...(c.contentData['leafNodes'] || [])];
                            return agg;
                        }, []);
                    } else {
                        return [];
                    }
                })();

                return this.fetchFromApi(contentStateRequest).toPromise();
            }),
            defer(() => this.fetchFromApi(contentStateRequest))
        );
    }

    private fetchFromApi(contentStateRequest: GetContentStateRequest) {
        if (contentStateRequest.contentIds && !contentStateRequest.contentIds.length) {
            delete contentStateRequest.contentIds;
        }

        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_CONTENT_STATE_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({request: contentStateRequest})
            .build();

        return defer(async () => {
            return this.apiService.fetch<any>(apiRequest).pipe(
                map((response) => {
                    return response.body;
                })
            ).toPromise();
        });
    }
}
