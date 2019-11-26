import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseBatchesRequest, CourseServiceConfig} from '..';
import {CourseBatchesResponse} from '../def/course-batches-response';
import {ServerProfile} from '../../profile/def/server-profile';
import {ProfileService} from '../../profile';
import {AuthService, OAuthSession} from '../../auth';
import {Observable, of} from 'rxjs';
import {map, mergeMap, switchMap} from 'rxjs/operators';

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
            .pipe(
                map((response) =>
                    Array.from<Batch>(new Set(response.body.result.response.content)))
            ).pipe(
                switchMap((batches: Batch[]) => {
                    return this.authService.getSession()
                        .pipe(
                            mergeMap((authSession?: OAuthSession) => {
                                if (!authSession) {
                                    return of(batches);
                                }
                                return this.profileService.getServerProfiles({
                                    limit: batches.length,
                                    filters: {
                                        identifier: new Set(batches.map(batch => batch.createdBy))
                                    },
                                    fields: ['firstName', 'lastName', 'identifier']
                                }).pipe(
                                    map((users: ServerProfile[]) => {
                                        batches.forEach((batch) => {
                                            batch.creatorFirstName = users.find(u => u.identifier === batch.createdBy)!.firstName;
                                            batch.creatorLastName = users.find(u => u.identifier === batch.createdBy)!.lastName;
                                        });

                                        return batches;
                                    })
                                );

                            })
                        );
                })
            );
    }
}
