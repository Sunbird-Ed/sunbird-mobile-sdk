import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseBatchesRequest, CourseServiceConfig} from '..';
import {Observable} from 'rxjs';
import {CourseBatchesResponse} from '../def/course-batches-response';
import {ServerProfile} from '../../profile/def/server-profile';
import {ProfileService} from '../../profile';
import { AuthService, OAuthSession } from '../../auth';

export class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private readonly GET_COURSE_BATCHES = '/batch/list';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private profileService: ProfileService,
                private authService: AuthService) {
    }

    handle(request: CourseBatchesRequest): Observable<Batch[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_COURSE_BATCHES)
            .withApiToken(true)
            .withSessionToken(false)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: CourseBatchesResponse } }>(apiRequest)
            .map((response) =>
                Array.from<Batch>(new Set(response.body.result.response.content)))
            .switchMap((batches: Batch[]) => {
                return this.authService.getSession().mergeMap((authSession?: OAuthSession) => {
                    if (!authSession) {
                        return Observable.of(batches);
                    }
                    return this.profileService.getServerProfiles({
                        limit: batches.length,
                        filters: {
                            identifier: new Set(batches.map(batch => batch.createdBy))
                        },
                        fields: ['firstName', 'lastName', 'identifier']
                    }).map((users: ServerProfile[]) => {
                        batches.forEach((batch) => {
                            batch.creatorFirstName = users.find(u => u.identifier === batch.createdBy)!.firstName;
                            batch.creatorLastName = users.find(u => u.identifier === batch.createdBy)!.lastName;
                        });

                        return batches;
                    });

                });
            });
    }
}
