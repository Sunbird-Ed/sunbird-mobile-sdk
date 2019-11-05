import {Observable} from 'rxjs';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';
import {SunbirdTelemetry} from '../../telemetry';
import {ApiService, HttpRequestType, Request} from '../../api';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {CourseService} from '..';

interface RawEntry {
    [CourseAssessmentEntry.COLUMN_NAME_USER_ID]: string;
    [CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID]: string;
    [CourseAssessmentEntry.COLUMN_NAME_COURSE_ID]: string;
    [CourseAssessmentEntry.COLUMN_NAME_BATCH_ID]: string;
    first_ts: number;
    events: string;
}

interface Entry {
    userId: string;
    contentId: string;
    courseId: string;
    batchId: string;
    firstTs: number;
    events: SunbirdTelemetry.Telemetry[];
}

interface AssessmentTelemetrySyncRequest {
    assessments: {
        assessmentTs: number; // Assessment time in epoch
        userId: string,  // User Identifier - required
        contentId: string, // Content Identifier - required
        courseId: string, // Course Identifier - required
        batchId: string; // Batch Identifier - required
        attemptId: string, // Attempt Identifier - required
        events: SunbirdTelemetry.Telemetry[] // Only 'ASSESS' Events - required
    }[];
}

export class SyncAssessmentEventsHandler {
    private static readonly UPDATE_CONTENT_STATE_ENDPOINT = '/content/state/update';

    private capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined } = {};

    constructor(
        private courseService: CourseService,
        private sdkConfig: SdkConfig,
        private apiService: ApiService,
        private dbService: DbService
    ) {
    }

    handle(capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined }): Observable<undefined> {
        this.capturedAssessmentEvents = capturedAssessmentEvents;

        return Observable.fromPromise(
            this.syncCapturedAssessmentEvents()
                .then(() => {
                    this.capturedAssessmentEvents = {};
                })
                .then(() => {
                    return this.syncPersistedAssessmentEvents();
                })
                .catch(() => {
                    Object.keys(this.capturedAssessmentEvents).forEach((key) => {
                        const context = JSON.parse(key);
                        this.capturedAssessmentEvents[key]!.forEach((event) => {
                            this.persistAssessEvent(event, context);
                        });
                    });
                })
        ).mapTo(undefined);
    }

    private invokeSyncApi(assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest) {
        const apiRequest: Request = new Request.Builder()
            .withPath(this.sdkConfig.courseServiceConfig.apiPath + SyncAssessmentEventsHandler.UPDATE_CONTENT_STATE_ENDPOINT)
            .withType(HttpRequestType.PATCH)
            .withBody({
                request: assessmentTelemetrySyncRequest
            })
            .withApiToken(true)
            .withSessionToken(true)
            .build();

        return this.apiService.fetch(apiRequest).toPromise();
    }

    private persistAssessEvent(event: SunbirdTelemetry.Telemetry, courseContext) {
        return this.dbService.insert({
            table: CourseAssessmentEntry.TABLE_NAME,
            modelJson: {
                [CourseAssessmentEntry.COLUMN_NAME_ASSESSMENT_EVENT]: JSON.stringify(event),
                [CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID]: event.object.id,
                [CourseAssessmentEntry.COLUMN_NAME_CREATED_AT]: event.ets,
                [CourseAssessmentEntry.COLUMN_NAME_USER_ID]: courseContext.userId,
                [CourseAssessmentEntry.COLUMN_NAME_COURSE_ID]: courseContext.courseId,
                [CourseAssessmentEntry.COLUMN_NAME_BATCH_ID]: courseContext.batchId,
            } as CourseAssessmentEntry.SchemaMap
        }).mapTo(undefined);
    }

    private async syncCapturedAssessmentEvents() {
        const assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest = {
            assessments: Object.keys(this.capturedAssessmentEvents).map((key) => {
                const context = JSON.parse(key);
                const events = this.capturedAssessmentEvents[key]!;

                return {
                    assessmentTs: events.reduce((acc, e) => e.ets < acc ? e.ets : acc, events[0].ets),
                    userId: context['userId'],
                    contentId: events[0].object.id,
                    courseId: context['courseId'],
                    batchId: context['batchId'],
                    attemptId: this.courseService.generateAssessmentAttemptId({
                        courseId: context['courseId'],
                        batchId: context['batchId'],
                        contentId: events[0].object.id,
                        userId: context['userId']
                    }),
                    events
                };
            })
        };

        if (!assessmentTelemetrySyncRequest.assessments.length) {
            return;
        }

        return this.invokeSyncApi(assessmentTelemetrySyncRequest);
    }

    private async syncPersistedAssessmentEvents() {
        this.dbService.execute(`
            SELECT
                ${CourseAssessmentEntry.COLUMN_NAME_USER_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_COURSE_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_BATCH_ID},
                MIN(${CourseAssessmentEntry.COLUMN_NAME_CREATED_AT}) as first_ts,
                GROUP_CONCAT(${CourseAssessmentEntry.COLUMN_NAME_ASSESSMENT_EVENT},',') as events
            FROM ${CourseAssessmentEntry.TABLE_NAME}
            GROUP BY
                ${CourseAssessmentEntry.COLUMN_NAME_USER_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_COURSE_ID},
                ${CourseAssessmentEntry.COLUMN_NAME_BATCH_ID}
            ORDER BY ${CourseAssessmentEntry.COLUMN_NAME_CREATED_AT}
        `).map((entries: RawEntry[]) => {
            return entries.map((entry) => {
                return {
                    userId: entry[CourseAssessmentEntry.COLUMN_NAME_USER_ID],
                    contentId: entry[CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID],
                    courseId: entry[CourseAssessmentEntry.COLUMN_NAME_COURSE_ID],
                    batchId: entry[CourseAssessmentEntry.COLUMN_NAME_BATCH_ID],
                    firstTs: entry.first_ts,
                    events: JSON.parse('[' + entry.events + ']')
                } as Entry;
            });
        }).mergeMap((entries: Entry[]) => {
            if (!entries.length) {
                return Observable.of(undefined);
            }

            const assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest = {
                assessments: entries.map(({firstTs, userId, contentId, courseId, batchId, events}) => {
                    return {
                        assessmentTs: firstTs,
                        userId,
                        contentId,
                        courseId,
                        batchId,
                        attemptId: this.courseService.generateAssessmentAttemptId({
                            courseId,
                            batchId,
                            contentId,
                            userId
                        }),
                        events
                    };
                })
            };

            return this.invokeSyncApi(assessmentTelemetrySyncRequest);
        }).mapTo(undefined).toPromise();
    }
}
