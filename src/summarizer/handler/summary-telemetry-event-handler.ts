import {ApiRequestHandler} from '../../api';
import {ProducerData, SunbirdTelemetry} from '../../telemetry';
import {Observable} from 'rxjs';
import {SummarizerService} from '..';
import {
    ContentState,
    ContentStateResponse,
    CourseService,
    CourseServiceImpl,
    GetContentStateRequest,
    UpdateContentStateRequest
} from '../../course';
import {SharedPreferences} from '../../util/shared-preferences';
import {ContentKeys} from '../../preference-keys';
import Telemetry = SunbirdTelemetry.Telemetry;
import {EventNamespace, EventsBusService} from '../../events-bus';
import {Content, ContentDetailRequest, ContentEventType, ContentMarkerRequest, ContentService, MarkerType, MimeType} from '../../content';
import {ContentAccess, ContentAccessStatus, ProfileService} from '../../profile';
import {ArrayUtil} from '../../util/array-util';
import {DbService} from '../../db';

export class SummaryTelemetryEventHandler implements ApiRequestHandler<Telemetry, undefined> {
    private static readonly CONTENT_PLAYER_PID = 'contentplayer';

    private currentUID?: string = undefined;
    private currentContentID?: string = undefined;
    private courseContext = {};

    constructor(
        private courseService: CourseService,
        private sharedPreference: SharedPreferences,
        private summarizerService: SummarizerService,
        private eventBusService: EventsBusService,
        private contentService: ContentService,
        private profileService: ProfileService,
        private dbService: DbService
    ) {
    }

    private static checkPData(pdata: ProducerData): boolean {
        if (pdata != null && pdata.pid !== null) {
            return pdata.pid.indexOf(SummaryTelemetryEventHandler.CONTENT_PLAYER_PID) !== -1;
        }
        return false;
    }

    private static checkIsCourse(event: SunbirdTelemetry.Telemetry): boolean {
        if (event.object != null && event.object.type && event.object.type.toLowerCase() === 'course') {
            return true;
        }

        return false;
    }

    private setCourseContextEmpty(): Observable<undefined> {
        this.courseContext = {};
        return this.sharedPreference.putString(ContentKeys.COURSE_CONTEXT, '');
    }

    updateContentState(event: Telemetry): Observable<undefined> {
        return this.getCourseContext().mergeMap((courseContext: any) => {
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
                return this.checkStatusOfContent(userId, courseId, batchId, contentId)
                    .mergeMap((status: number) => {
                        if (event.eid === 'START' && status === 0) {
                            const updateContentStateRequest: UpdateContentStateRequest = {
                                userId: userId,
                                contentId: contentId,
                                courseId: courseId,
                                batchId: batchId,
                                status: 1,
                                progress: 5
                            };

                            return this.courseService.updateContentState(updateContentStateRequest)
                                .mapTo(undefined);
                        } else if ((event.eid === 'END' && status === 0) ||
                            (event.eid === 'END' && status === 1)) {
                            const updateContentStateRequest: UpdateContentStateRequest = {
                                userId: userId,
                                contentId: contentId,
                                courseId: courseId,
                                batchId: batchId,
                                status: 2,
                                progress: 100
                            };
                            return this.validEndEvent(event, courseContext).mergeMap((isValid: boolean) => {
                                if (isValid) {
                                    return this.courseService.updateContentState(updateContentStateRequest)
                                        .do(() => {
                                            this.eventBusService.emit({
                                                namespace: EventNamespace.CONTENT,
                                                event: {
                                                    type: ContentEventType.COURSE_STATE_UPDATED,
                                                    payload: {
                                                        contentId: updateContentStateRequest.courseId
                                                    }
                                                }
                                            });
                                        }).mapTo(undefined);
                                } else {
                                    return Observable.of(undefined);
                                }
                            });
                        }

                        return Observable.of(undefined);
                    }).do(() => {
                        this.updateLastReadContentId(userId, courseId, batchId, contentId).toPromise();
                    });
            } else {
                return Observable.of(undefined);
            }

        });
    }

    private validEndEvent(event: Telemetry, courseContext?: any): Observable<boolean> {
        const uid = event.actor.id;
        const identifier = event.object.id;
        const request: ContentDetailRequest = {
            contentId: identifier
        };
        return this.contentService.getContentDetails(request).map((content: Content) => {
            const playerSummary: Array<any> = event.edata['summary'];
            const contentMimeType = content.mimeType;
            // const validSummary = (summaryList: Array<any>) => (percentage: number) => _find(summaryList, (requiredProgress =>
            //     summary => summary && summary.progress >= requiredProgress)(percentage));
            if (content.contentType === 'SelfAssess' && courseContext && this.courseService.hasCapturedAssessmentEvent({courseContext})) {
                return false;
            }

            if (this.findValidProgress(playerSummary, 20) &&
                ArrayUtil.contains([MimeType.YOUTUBE, MimeType.VIDEO, MimeType.WEBM], contentMimeType)) {
                return true;
            } else if (this.findValidProgress(playerSummary, 0) &&
                ArrayUtil.contains([MimeType.H5P, MimeType.HTML], contentMimeType)) {
                return true;
            } else if (this.findValidProgress(playerSummary, 100)) {
                return true;
            }
            return false;
        });
    }

    private isProgressValid(summary: any, requiredProgress: number): boolean {
        return summary && summary.progress >= requiredProgress;
    }

    private findValidProgress(summaryList: Array<any>, requiredProgress): any | undefined {
        return summaryList.find((summary) => this.isProgressValid(summary, requiredProgress));
    }


    private updateLastReadContentId(userId: string, courseId: string, batchId: string, contentId: string): Observable<undefined> {
        const key = CourseServiceImpl.LAST_READ_CONTENTID_PREFIX.concat('_')
            .concat(userId).concat('_')
            .concat(courseId).concat('_')
            .concat(batchId);
        return this.sharedPreference.putString(key, contentId);
    }


    handle(event: SunbirdTelemetry.Telemetry): Observable<undefined> {
        if (event.eid === 'START' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            return this.processOEStart(event)
                .do(async () => {
                    await this.summarizerService.saveLearnerAssessmentDetails(event)
                        .mapTo(undefined)
                        .toPromise();
                })
                .do(async () => {
                    await this.getCourseContext().mergeMap(() => {
                        return this.updateContentState(event);
                    }).toPromise();
                }).do(async () => {
                    await this.markContentAsPlayed(event)
                        .toPromise();
                });
        } else if (event.eid === 'START' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            return this.getCourseContext().mapTo(undefined);
        } else if (event.eid === 'ASSESS' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            return this.processOEAssess(event)
                .do(async () => {
                    const context = await this.getCourseContext().toPromise();
                    if (
                        event.context.cdata.find((c) => c.type === 'AttemptId')
                        && context.userId && context.courseId && context.batchId
                    ) {
                        await this.courseService.captureAssessmentEvent({event, courseContext: context});
                    }
                })
                .do(async () => {
                    await this.summarizerService.saveLearnerAssessmentDetails(event)
                        .mapTo(undefined)
                        .toPromise();
                });
        } else if (event.eid === 'END' && SummaryTelemetryEventHandler.checkPData(event.context.pdata)) {
            return this.processOEEnd(event)
                .do(async () => {
                    await this.summarizerService.saveLearnerContentSummaryDetails(event)
                        .mapTo(undefined)
                        .toPromise();
                })
                .do(async () => {
                    await this.getCourseContext().mergeMap(() => {
                        return this.updateContentState(event);
                    }).toPromise();
                });
        } else if (event.eid === 'END' && SummaryTelemetryEventHandler.checkIsCourse(event)) {
            return this.setCourseContextEmpty();
        } else {
            return Observable.of(undefined);
        }
    }

    private markContentAsPlayed(event): Observable<boolean> {
        const uid = event.actor.id;
        const identifier = event.object.id;
        const request: ContentDetailRequest = {
            contentId: identifier
        };
        return this.contentService.getContentDetails(request).mergeMap((content: Content) => {
            const addContentAccessRequest: ContentAccess = {
                status: ContentAccessStatus.PLAYED,
                contentId: identifier,
                contentType: content.contentType
            };
            return this.profileService.addContentAccess(addContentAccessRequest).mergeMap(() => {
                const contentMarkerRequest: ContentMarkerRequest = {
                    uid: uid,
                    contentId: identifier,
                    data: JSON.stringify(content.contentData),
                    marker: MarkerType.PREVIEWED,
                    isMarked: true,
                    extraInfo: {}
                };
                return this.contentService.setContentMarker(contentMarkerRequest).mapTo(true);
            });
        });
    }

    private getCourseContext(): Observable<any> {
        return this.sharedPreference.getString(ContentKeys.COURSE_CONTEXT).map((value: string | undefined) => {
            return value ? JSON.parse(value) : {};
        });
    }

    private checkStatusOfContent(userId: string, courseId: string, batchId: string, contentId: string): Observable<number> {
        const contentStateRequest: GetContentStateRequest = {
            userId: userId,
            batchId: batchId,
            contentIds: [contentId],
            courseIds: [courseId]
        };

        return this.courseService.getContentState(contentStateRequest).map((contentStateResponse?: ContentStateResponse) => {
            const contentStateList: ContentState[] = contentStateResponse! && contentStateResponse!.contentList;
            return this.getStatus(contentStateList, contentId);
        });
    }

    private getStatus(contentStateList: ContentState[] = [], contentId): number {
        const content = contentStateList.find(c => c.contentId === contentId);
        return (content && content.status) || 0;
    }


    private processOEStart(event: Telemetry): Observable<undefined> {
        this.currentUID = event.actor.id;
        this.currentContentID = event.object.id;

        return Observable.of(undefined);
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
            ).do(() => {
                this.currentUID = undefined;
                this.currentContentID = undefined;
            }).mapTo(undefined);
        }

        return Observable.of(undefined);
    }

    private processOEEnd(event: Telemetry): Observable<undefined> {
        return Observable.of(undefined);
    }
}

