import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseBatchesRequest, CourseServiceConfig} from '..';
import {Observable} from 'rxjs';
import {CourseBatchesResponse} from '../def/course-batches-response';
import {ServerProfile} from '../../profile/def/server-profile';
import {ProfileService} from '../../profile';

export class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private readonly GET_COURSE_BATCHES = '/api/course/v1/batch/list';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private profileService: ProfileService) {
    }

    handle(request: CourseBatchesRequest): Observable<Batch[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_COURSE_BATCHES)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: CourseBatchesResponse } }>(apiRequest)
            .map((response) =>
                Array.from<Batch>(new Set(response.body.result.response.content)))
            .switchMap((batches: Batch[]) => {
                return this.profileService.getServerProfiles({
                    limit: batches.length,
                    identifiers: new Set(batches.map(batch => batch.createdBy)),
                    fields: ['firstName', 'lastName', 'identifier']
                }).map((users: ServerProfile[]) => {
                    batches.forEach((batch) => {
                        batch.creatorFirstName = users.find(u => u.identifier === batch.createdBy)!.firstName;
                        batch.creatorLastName = users.find(u => u.identifier === batch.createdBy)!.lastName;
                    });

                    return batches;
                });
            });
    }
}
