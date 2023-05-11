import {ApiRequestHandler} from '../../api';
import {Actor, AuditState, ProducerData, Rollup, SunbirdTelemetry, TelemetryAuditRequest} from '../../telemetry';
import {SummarizerService} from '..';
import {
    ContentState,
    ContentStateResponse,
    CourseService,
    CourseServiceImpl,
    GetContentStateRequest,
    UpdateContentStateRequest,
    UpdateContentStateTarget
} from '../../course';
import {SharedPreferences} from '../../util/shared-preferences';
import {ContentKeys} from '../../preference-keys';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {Content, ContentDetailRequest, ContentEventType, ContentMarkerRequest, ContentService, MarkerType} from '../../content';
import {ContentAccess, ContentAccessStatus, ProfileService} from '../../profile';
import {defer, iif, Observable, of} from 'rxjs';
import {delay, map, mapTo, mergeMap, tap} from 'rxjs/operators';
import {CsContentProgressCalculator} from '@project-sunbird/client-services/services/content/utilities/content-progress-calculator';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';
import {CsPrimaryCategory} from '@project-sunbird/client-services/services/content';
import {TrackingEnabled} from '@project-sunbird/client-services/models/content/index';
import Telemetry = SunbirdTelemetry.Telemetry;

class TrackableSessionProxyContentProvider {
    private trackableSessionContentCache?: { [identifier: string]: Content | undefined };

    constructor(
        private contentService: ContentService
    ) {
    }

    provide(request: ContentDetailRequest, primaryCategory: string): Observable<Content> {
        request.objectType = TrackableSessionProxyContentProvider.getCategoryMapper(primaryCategory);
        if (this.trackableSessionContentCache) {
            return iif(
                () => !!this.trackableSessionContentCache![request.contentId],
                defer(() => of(this.trackableSessionContentCache![request.contentId]!)),
                defer(() => this.contentService.getContentDetails(request).pipe(
                    tap((content) => this.trackableSessionContentCache![request.contentId] = content)
                ))
            );
        }

        return this.contentService.getContentDetails(request);
    }

    cache(content: Content) {
        if (this.trackableSessionContentCache) {
            this.trackableSessionContentCache[content.identifier] = content;
        }
    }

    init() {
        this.trackableSessionContentCache = {};
    }

    dispose() {
        this.trackableSessionContentCache = undefined;
    }

    private static getCategoryMapper(primaryCategory: string) {
        switch (primaryCategory) {
            case CsPrimaryCategory.PRACTICE_QUESTION_SET:
                return 'QuestionSet';
            case 'Multiple Choice Question':
                return 'Question';
        }
    }
}

export class SummaryTelemetryEventHandler implements ApiRequestHandler<Telemetry, undefined> {
    private static readonly CONTENT_PLAYER_PID = 'contentplayer';

    private currentUID?: string = undefined;
    private currentContentID?: string = undefined;
    private courseContext = {};
    private trackableSessionProxyContentProvider: TrackableSessionProxyContentProvider;

    constructor(
        private courseService: CourseService,
        private sharedPreference: SharedPreferences,
        private summarizerService: SummarizerService,
        private eventBusService: EventsBusService,
        private contentService: ContentService,
        private profileService: ProfileService,
    ) {
        this.trackableSessionProxyContentProvider = new TrackableSessionProxyContentProvider(this.contentService);
    }

    private static checkPData(pdata: ProducerData): boolean {
        if (pdata != null && pdata.pid !== null) {
            return pdata.pid.indexOf(SummaryTelemetryEventHandler.CONTENT_PLAYER_PID) !== -1;
        }
        return false;
    }

    private static isContentTrackable(
        content: Content
    ): boolean {
        return !!content.contentData.trackable && content.contentData.trackable.enabled === TrackingEnabled.YES;
    }

    private static isCourseAssessmentContent(content) {
        return content.primaryCategory && (content.primaryCategory.toLowerCase() === CsPrimaryCategory.COURSE_ASSESSMENT.toLowerCase());
    }

    updateContentState(event: Telemetry): Observable<undefined> {
        return this.getCourseContext().pipe(
            mergeMap((courseContext: any) => {
                const userId = courseContext['userId'];
                const courseId = courseContext['courseId'];
                const batchId = courseContext['batchId'];
                let batchStatus = 0;
                if (courseContext.hasOwnProperty('batchStatus')) {
                    batchStatus = courseContext['batchStatus'];
                }

                const BATCH_IN_PROGRESS = 1;
                if (batchStatus === BATCH_IN_PROGRESS) { // If the batch is expired then do not update content status.
                    const contentId = event.object.id;
                    return this.checkStatusOfContent(userId, courseId, batchId, contentId).pipe(
                        mergeMap((status: number) => {
                            if (event.eid === 'START' && status === 0) {
                                const updateContentStateRequest: UpdateContentStateRequest = {
                                    userId: userId,
                                    contentId: contentId,
                                    courseId: courseId,
                                    batchId: batchId,
                                    status: 1,
                                    progress: 5
                                };

                                return this.courseService.updateContentState(updateContentStateRequest).pipe(
                                    mapTo(undefined)
                                );
                            } else if ((event.eid === 'END' && status === 0) ||
                                (event.eid === 'END' && status === 1)) {
                                return this.trackableSessionProxyContentProvider.provide(
                                    {contentId: event.object.id},
                                    event.object.type
                                ).pipe(
                                    mergeMap((content) => {
                                        return this.validEndEvent(event, content, courseContext).pipe(
                                            mergeMap((isValid: boolean) => {
                                                if (isValid) {
                                                    const progress = CsContentProgressCalculator.calculate
                                                    (event.edata.summary, content.mimeType as any);
                                                    const updateContentStateRequest: UpdateContentStateRequest = {
                                                        userId: userId,
                                                        contentId: content.identifier,
                                                        courseId: courseId,
                                                        batchId: batchId,
                                                        status: progress === 100 ? 2 : 1,
                                                        progress,
                                                        target: SummaryTelemetryEventHandler.isCourseAssessmentContent(content) ?
                                                            [UpdateContentStateTarget.LOCAL] :
                                                            [UpdateContentStateTarget.LOCAL, UpdateContentStateTarget.SERVER]
                                                    };
                                                    this.generateAuditTelemetry(userId, courseId, batchId, content,
                                                        event.object ? event.object.rollup! : {});
                                                    return this.courseService.updateContentState(updateContentStateRequest).pipe(
                                                        tap(() => {
                                                            this.eventBusService.emit({
                                                                namespace: EventNamespace.CONTENT,
                                                                event: {
                                                                    type: ContentEventType.COURSE_STATE_UPDATED,
                                                                    payload: {
                                                                        contentId: updateContentStateRequest.courseId
                                                                    }
                                                                }
                                                            });
                                                        }),
                                                        mapTo(undefined)
                                                    );
                                                } else {
                                                    return of(undefined);
                                                }
                                            })
                                        );
                                    })
                                );
                            }

                            return of(undefined);
                        }),
                        tap(() => {
                            this.updateLastReadContentId(userId, courseId, batchId, contentId).toPromise();
                        })
                    );
                } else {
                    return of(undefined);
                }

            })
        );
    }

    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined> {
        return defer(async () => {
            if (event.eid === 'START') {
                if (SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
                    this.courseService.resetCapturedAssessmentEvents();

                    return this.processOEStart(event).pipe(
                        tap(async () => {
                            await this.summarizerService.saveLearnerAssessmentDetails(event).pipe(
                                mapTo(undefined)
                            ).toPromise();
                        }),
                        tap(async () => {
                            await this.getCourseContext().pipe(
                                mergeMap(() => {
                                    return this.updateContentState(event);
                                })
                            ).toPromise();
                        }),
                        tap(async () => {
                            await this.markContentAsPlayed(event)
                                .toPromise();
                        })
                    ).toPromise();
                } else if (event.object && event.object.id) {
                    const content = await this.trackableSessionProxyContentProvider
                        .provide({contentId: event.object.id}, event.object.type).toPromise();

                    if (SummaryTelemetryEventHandler.isContentTrackable(content)) {
                        this.trackableSessionProxyContentProvider.init();
                        this.trackableSessionProxyContentProvider.cache(content);

                        return this.getCourseContext().pipe(
                            mapTo(undefined)
                        ).toPromise();
                    }
                }
            } else if (event.eid === 'ASSESS' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
                return this.processOEAssess(event).pipe(
                    tap(async () => {
                        const context = await this.getCourseContext().toPromise();
                        if (
                            event.context.cdata.find((c) => c.type === 'AttemptId')
                            && context.userId && context.courseId && context.batchId
                        ) {
                            await this.courseService.captureAssessmentEvent({event, courseContext: context});
                        }
                    }),
                    tap(async () => {
                        await this.summarizerService.saveLearnerAssessmentDetails(event).pipe(
                            mapTo(undefined)
                        ).toPromise();
                    })
                ).toPromise();
            } else if (event.eid === 'END') {
                if (SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
                    return this.processOEEnd(event).pipe(
                        tap(async () => {
                            await this.summarizerService.saveLearnerContentSummaryDetails(event).pipe(
                                mapTo(undefined)
                            ).toPromise();
                        }),
                        tap(async () => {
                            await this.getCourseContext().pipe(
                                mergeMap(() => {
                                    return this.updateContentState(event);
                                })
                            ).toPromise();
                        })
                    ).toPromise();
                } else if (event.object && event.object.id) {
                    const content = await this.trackableSessionProxyContentProvider
                        .provide({contentId: event.object.id}, event.object.type).toPromise();

                    if (SummaryTelemetryEventHandler.isContentTrackable(content)) {
                        this.trackableSessionProxyContentProvider.dispose();

                        return this.setCourseContextEmpty().toPromise();
                    }
                }
            }
        });
    }

    private setCourseContextEmpty(): Observable<undefined> {
        this.courseContext = {};
        return this.sharedPreference.putString(ContentKeys.COURSE_CONTEXT, '');
    }

    private validEndEvent(event: Telemetry, content: Content, courseContext?: any): Observable<boolean> {
        const isCourseAssessmentSyncPending = () => {
            return courseContext &&
                (
                    SummaryTelemetryEventHandler.isCourseAssessmentContent(content) ||
                    (content.contentType && content.contentType.toLowerCase() === 'onboardingresource') ||
                    (content.primaryCategory && content.primaryCategory.toLowerCase() === 'onboardingresource')
                ) &&
                this.courseService.hasCapturedAssessmentEvent({courseContext});
        };

        return defer(() => of(undefined))
            .pipe(
                delay(2000),
                map(() => {
                    if (isCourseAssessmentSyncPending()) {
                        return false;
                    }
                    return event.edata.summary && !!event.edata.summary.find((s) => s['progress']);
                }),
                tap(() => this.courseService.resetCapturedAssessmentEvents())
            );
    }

    private updateLastReadContentId(userId: string, courseId: string, batchId: string, contentId: string): Observable<undefined> {
        const key = CourseServiceImpl.LAST_READ_CONTENTID_PREFIX.concat('_')
            .concat(userId).concat('_')
            .concat(courseId).concat('_')
            .concat(batchId);
        return this.sharedPreference.putString(key, contentId);
    }

    private markContentAsPlayed(event): Observable<boolean> {
        const uid = event.actor.id;
        const identifier = event.object.id;
        const request: ContentDetailRequest = {
            contentId: identifier
        };
        return this.trackableSessionProxyContentProvider.provide(request, event.object.type).pipe(
            mergeMap((content: Content) => {
                const addContentAccessRequest: ContentAccess = {
                    status: ContentAccessStatus.PLAYED,
                    contentId: identifier,
                    contentType: content.contentType || content.primaryCategory!
                };
                return this.profileService.addContentAccess(addContentAccessRequest).pipe(
                    mergeMap(() => {
                        const contentMarkerRequest: ContentMarkerRequest = {
                            uid: uid,
                            contentId: identifier,
                            data: JSON.stringify(content.contentData),
                            marker: MarkerType.PREVIEWED,
                            isMarked: true,
                            extraInfo: {}
                        };
                        return this.contentService.setContentMarker(contentMarkerRequest).pipe(
                            mapTo(true)
                        );
                    })
                );
            })
        );
    }

    private getCourseContext(): Observable<any> {
        return this.sharedPreference.getString(ContentKeys.COURSE_CONTEXT).pipe(
            map((value: string | undefined) => {
                return value ? JSON.parse(value) : {};
            })
        );
    }

    private checkStatusOfContent(userId: string, courseId: string, batchId: string, contentId: string): Observable<number> {
        const contentStateRequest: GetContentStateRequest = {
            userId: userId,
            batchId: batchId,
            contentIds: [contentId],
            courseId
        };

        return this.courseService.getContentState(contentStateRequest).pipe(
            map((contentStateResponse?: ContentStateResponse) => {
                const contentStateList: ContentState[] = contentStateResponse! && contentStateResponse!.contentList;
                return this.getStatus(contentStateList, contentId);
            })
        );
    }

    private getStatus(contentStateList: ContentState[] = [], contentId): number {
        const content = contentStateList.find(c => c.contentId === contentId);
        return (content && content.status) || 0;
    }

    private processOEStart(event: Telemetry): Observable<undefined> {
        this.currentUID = event.actor.id;
        this.currentContentID = event.object.id;

        return of(undefined);
    }

    private processOEAssess(event: Telemetry): Observable<undefined> {
        if (
            this.currentUID && this.currentContentID &&
            this.currentUID.toLocaleLowerCase() === event.actor.id.toLocaleLowerCase() &&
            this.currentContentID.toLocaleLowerCase() === event.object.id.toLocaleLowerCase()
        ) {
            return this.summarizerService.deletePreviousAssessmentDetails(
                this.currentUID,
                this.currentContentID
            ).pipe(
                tap(() => {
                    this.currentUID = undefined;
                    this.currentContentID = undefined;
                }),
                mapTo(undefined)
            );
        }

        return of(undefined);
    }

    private processOEEnd(event: Telemetry): Observable<undefined> {
        return of(undefined);
    }

    private generateAuditTelemetry(userId: string, courseId: string, batchId: string, content: Content, rollup: Rollup) {
        const actor = new Actor();
        actor.id = userId;
        actor.type = Actor.TYPE_USER;
        const cdata = [
            {
                type: 'CourseId',
                id: courseId || ''
            },
            {
                type: 'BatchId',
                id: batchId || ''
            },
            {
                type: 'UserId',
                id: userId || ''
            },
            {
                type: 'ContentId',
                id: content.identifier || ''
            }
        ];

        const auditRequest: TelemetryAuditRequest = {
            env: 'course',
            actor,
            currentState: AuditState.AUDIT_UPDATED,
            updatedProperties: ['progress'],
            objId: content.identifier,
            objType: content.contentData.contentType || '',
            objVer: content.contentData.pkgVersion || '',
            rollUp: rollup || {},
            correlationData: cdata,
            type: 'content-progress'
        };
        TelemetryLogger.log.audit(auditRequest).toPromise();
    }
}
