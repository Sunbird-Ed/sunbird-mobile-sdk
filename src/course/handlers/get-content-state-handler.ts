import {ApiService} from '../../api';
import {ContentState, CourseServiceConfig, GetContentStateRequest} from '..';
import {defer, iif, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ContentService} from '../../content';
import {Container} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {CsCourseService} from '@project-sunbird/client-services/services/course';

export class GetContentStateHandler {
    constructor(
        private apiService: ApiService,
        private courseServiceConfig: CourseServiceConfig,
        private container: Container
    ) {
    }

    private get csCourseService(): CsCourseService {
        return this.container.get(CsInjectionTokens.COURSE_SERVICE);
    }

    private get contentService(): ContentService {
        return this.container.get(InjectionTokens.CONTENT_SERVICE);
    }

    public handle(contentStateRequest: GetContentStateRequest): Observable<{ contentList: ContentState[] }> {
        delete contentStateRequest['returnRefreshedContentStates'];

        return iif(
            () => !contentStateRequest.contentIds || !contentStateRequest.contentIds.length,
            defer(async () => {
                contentStateRequest.contentIds = await this.contentService.getContentDetails({
                    contentId: contentStateRequest.courseId
                }).toPromise().then((content) => content.contentData['leafNodes'] || []);

                return this.fetchFromApi(contentStateRequest).toPromise();
            }),
            defer(() => this.fetchFromApi(contentStateRequest))
        );
    }

    private fetchFromApi(contentStateRequest: GetContentStateRequest) {
        if (contentStateRequest.contentIds && !contentStateRequest.contentIds.length) {
            delete contentStateRequest.contentIds;
        }

        return this.csCourseService.getContentState(contentStateRequest).pipe(
            map((contentStates: ContentState[]) => ({ contentList: contentStates }))
        );
    }
}
