import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {CourseServiceConfig, EnrollCourseRequest} from '..';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import { TelemetryLogger } from '../../telemetry/util/telemetry-logger';
import { TelemetryAuditRequest, Actor, AuditState } from '../../telemetry';

export class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {

    private readonly ENROL_ENDPOINT = '/enrol';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    handle(request: EnrollCourseRequest): Observable<boolean> {
        delete request.batchStatus;
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.ENROL_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest)
            .pipe(
                map((success) => {
                    return success.body.result.response === 'SUCCESS';
                }), tap(() => {
                    this.generateAuditTelemetry(request);
                })
            );
    }

    private generateAuditTelemetry(request: EnrollCourseRequest) {
        const actor = new Actor();
        actor.id = request.userId;
        actor.type = Actor.TYPE_USER;
        const cdata = [
            {
                type: 'CourseId',
                id: request.courseId
            },
            {
                type: 'BatchId',
                id: request.batchId
            },
            {
                type: 'UserId',
                id: request.userId
            }
        ];

        const auditRequest: TelemetryAuditRequest = {
            env: 'course',
            actor,
            currentState: AuditState.AUDIT_CREATED,
            updatedProperties: ['courseId', 'userId', 'batchId'],
            objId: request.courseId,
            objType: 'Course',
            rollUp: { l1: request.courseId},
            correlationData : cdata,
            type: 'enrollment'
        };
        TelemetryLogger.log.audit(auditRequest).toPromise();
    }
}
