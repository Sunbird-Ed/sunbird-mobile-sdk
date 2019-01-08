import {ApiRequestHandler} from '../def/api-request-handler';
import {CourseBatchesRequest} from '../def/request-types';
import {Batch} from '../def/batch';
import {Observable} from 'rxjs';
import {ApiService, HttpRequestType, Request} from '../../api';
import {CourseBatchesResponse} from '../def/course-batches-response';
import {User} from '../../profile/def/user';
import {CourseServiceConfig} from '../config/course-service-config';
import {SessionAuthenticator} from '../../auth';
import {ProfileService} from '../../profile';

export class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private readonly GET_COURSE_BATCHES = 'batch/list/';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private sessionAuthenticator: SessionAuthenticator,
                private profileService: ProfileService) {
    }

    handle(request: CourseBatchesRequest): Observable<Batch[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_COURSE_BATCHES)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: CourseBatchesResponse } }>(apiRequest)
            .map((response) =>
                Array.from<Batch>(new Set(response.body.result.response.content)))
            .switchMap((batches: Batch[]) => {
                return this.profileService.getUsers({
                    limit: batches.length,
                    identifiers: new Set(batches.map(batch => batch.createdBy)),
                    fields: ['firstName', 'lastName', 'identifier']
                }).map((users: User[]) => {
                    batches.forEach((batch) => {
                        batch.creatorFirstName = users.find(u => u.identifier === batch.createdBy)!.firstName;
                        batch.creatorLastName = users.find(u => u.identifier === batch.createdBy)!.lastName;
                    });

                    return batches;
                });
            });
    }
}
