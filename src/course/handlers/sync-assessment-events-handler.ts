import {from, Observable, Observer, of} from 'rxjs';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';
import {SunbirdTelemetry} from '../../telemetry';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {ContentState, CourseService} from '..';
import {map, mapTo, mergeMap, tap} from 'rxjs/operators';
import {NetworkQueue, NetworkQueueType} from '../../api/network-queue';
import {NetworkRequestHandler} from '../../api/network-queue/handlers/network-request-handler';
import {UniqueId} from '../../db/util/unique-id';
import {ObjectUtil} from '../../util/object-util';

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
    userId: string;
    contents: ContentState[];
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
    private dbService: DbService,
    private networkQueue: NetworkQueue
  ) {
  }

  handle(capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined }): Observable<undefined> {
    this.capturedAssessmentEvents = capturedAssessmentEvents;

    return from(
      this.syncCapturedAssessmentEvents()
        .then(() => {
          this.capturedAssessmentEvents = {};
        })
        .then(() => {
          return this.syncPersistedAssessmentEvents();
        })
        .catch((e) => {
          Object.keys(this.capturedAssessmentEvents).forEach((key) => {
            const context = JSON.parse(key);
            this.capturedAssessmentEvents[key]!.forEach((event) => {
              if (context.batchStatus !== 2) {
                this.persistAssessEvent(event, context).toPromise();
              }
            });
          });
        })
    ).pipe(
      mapTo(undefined)
    );
  }

  private invokeSyncApi(assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest) {
    console.log(
      'COURSE_ASSESSMENT_INVOKED_SYNC----------------------------------------------',
      assessmentTelemetrySyncRequest.assessments.map((a) => ({
        assessmentTs: a.assessmentTs,
        userId: a.userId,
        contentId: a.contentId,
        courseId: a.courseId,
        batchId: a.batchId,
        attemptId: a.attemptId,
        events: a.events.length
      }))
    );

    return this.networkQueue.enqueue(new NetworkRequestHandler(this.sdkConfig).generateNetworkQueueRequest(
      NetworkQueueType.COURSE_ASSESMENT,
      {request: assessmentTelemetrySyncRequest},
      UniqueId.generateUniqueId(), 0,
      true),
      true).pipe(
      mergeMap(() => {
        return new Observable((observer: Observer<{ [key: string]: any }>) => {
          sbsync.onSyncSucces(async (response) => {
            const courseAssesmentResponse = response.courseAssesmentResponse;
            const error = response.course_assesment_error;
            if (courseAssesmentResponse) {
              observer.next(courseAssesmentResponse);
            } else if (error) {
              observer.error(error);
            }
            observer.complete();
          }, async (error) => {
            observer.error(error);
          });
        });
      })).toPromise();
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
    }).pipe(
      mapTo(undefined)
    );
  }

  private async syncCapturedAssessmentEvents() {
      const assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest = Object.keys(this.capturedAssessmentEvents)
          .reduce<AssessmentTelemetrySyncRequest>((acc, key) => {
              const context = JSON.parse(key);
              const events = this.capturedAssessmentEvents[key]!;

              if (!acc.userId) {
                  acc.userId = context['userId'];
              }

              const contentState: ContentState = {
                  contentId: events[0].object.id,
                  courseId: context['courseId'],
                  batchId: context['batchId'],
                  status: 2
              };

              if (!acc.contents.find((c) => ObjectUtil.equals(c, contentState))) {
                  acc.contents.push(contentState);
              }

              const assessmentTs = events.reduce((etsAcc, e) =>
                  e.ets < etsAcc ? e.ets : etsAcc, events[0].ets);

              acc.assessments.push({
                  assessmentTs: assessmentTs,
                  userId: context['userId'],
                  contentId: events[0].object.id,
                  courseId: context['courseId'],
                  batchId: context['batchId'],
                  attemptId: this.courseService.generateAssessmentAttemptId({
                      courseId: context['courseId'],
                      batchId: context['batchId'],
                      contentId: events[0].object.id,
                      userId: context['userId'],
                      date: assessmentTs
                  }),
                  events
              });
              return acc;
          }, {userId: '', contents: [], assessments: []});

      if (
          !assessmentTelemetrySyncRequest.userId ||
          !assessmentTelemetrySyncRequest.contents.length ||
          !assessmentTelemetrySyncRequest.assessments.length
      ) {
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
        `).pipe(
      map((entries: RawEntry[]) => {
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
      }),
      mergeMap((entries: Entry[]) => {
          if (!entries.length) {
              return of(undefined);
          }

          const assessmentTelemetrySyncRequest: AssessmentTelemetrySyncRequest = entries
              .reduce<AssessmentTelemetrySyncRequest>((acc, {
                  firstTs, userId, contentId, courseId, batchId, events
              }) => {
                  if (!acc.userId) {
                      acc.userId = userId;
                  }

                  const contentState: ContentState = {
                      contentId: contentId,
                      courseId: courseId,
                      batchId: batchId,
                      status: 2
                  };

                  if (!acc.contents.find((c) => ObjectUtil.equals(c, contentState))) {
                      acc.contents.push(contentState);
                  }

                  acc.assessments.push({
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
                  });
                  return acc;
              }, {userId: '', contents: [], assessments: []});
          return this.invokeSyncApi(assessmentTelemetrySyncRequest);
      }),
      tap(async () =>
        await this.dbService.execute(`DELETE FROM ${CourseAssessmentEntry.TABLE_NAME}`).toPromise()
      ),
      mapTo(undefined)
    ).toPromise();
  }
}
