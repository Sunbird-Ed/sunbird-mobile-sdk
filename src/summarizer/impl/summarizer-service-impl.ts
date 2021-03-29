import {
    ContentCache,
    LearnerAssessmentDetails,
    LearnerAssessmentSummary,
    LearnerContentSummaryDetails,
    QuestionSummary,
    ReportDetailPerUser,
    SummarizerHandler,
    SummarizerQueries,
    SummarizerService,
    SummaryRequest,
    SummaryTelemetryEventHandler
} from '..';
import {DbService} from '../../db';
import {LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {SunbirdTelemetry} from '../../telemetry';
import {NumberUtil} from '../../util/number-util';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {Content, ContentRequest, ContentService} from '../../content';
import {TelemetryEvent, TelemetryEventType} from '../../telemetry/def/telemetry-event';
import {CourseService} from '../../course';
import {SharedPreferences} from '../../util/shared-preferences';
import {ProfileService} from '../../profile';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {EventObserver} from '../../events-bus/def/event-observer';
import {Observable, of} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {ValidationError} from '../../errors';
import Telemetry = SunbirdTelemetry.Telemetry;

@injectable()
export class SummarizerServiceImpl implements SummarizerService, EventObserver<TelemetryEvent> {
    private contentMap: Map<string, ContentCache>;
    private summarizerTelemetryHandler: SummaryTelemetryEventHandler;

    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.CONTENT_SERVICE) private contenService: ContentService,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
        @inject(InjectionTokens.COURSE_SERVICE) private courseService: CourseService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreference: SharedPreferences,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService
    ) {
        this.summarizerTelemetryHandler = new SummaryTelemetryEventHandler(this.courseService, this.sharedPreference, this,
            this.eventsBusService, this.contenService, this.profileService);
    }

    onInit(): Observable<undefined> {
        this.eventsBusService.registerObserver({namespace: EventNamespace.TELEMETRY, observer: this});
        return of(undefined);
    }

    getDetailsPerQuestion(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const query = SummarizerQueries.getQuetsionDetailsQuery(request.uids, request.contentId, request.qId);
        return this.dbService.execute(query).pipe(
            map((questionSummaries: QuestionSummary[]) =>
                SummarizerHandler.mapDBEntriesToQuestionDetails(questionSummaries))
        );
    }

    getLearnerAssessmentDetails(request: SummaryRequest): Observable<Map<string, ReportDetailPerUser>> {
        const query = SummarizerQueries.getDetailReportsQuery(request.uids, request.contentId);
        return this.dbService.execute(query).pipe(
            map((assessmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]) =>
                SummarizerHandler.mapDBEntriesToLearnerAssesmentDetails(assessmentDetailsInDb))
        );
    }

    getReportByQuestions(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const questionReportQuery = SummarizerQueries.getQuestionReportsQuery(request.uids, request.contentId);
        const accuracyQuery = SummarizerQueries.getReportAccuracyQuery(request.uids, request.contentId);
        return this.dbService.execute(accuracyQuery).pipe(
            map((accuracyReports: LearnerAssessmentsEntry.AccuracySchema[]) => SummarizerHandler.mapDBEntriesToAccuracy(accuracyReports)),
            mergeMap((accuracyMap: { [key: string]: any }) => {
                return this.dbService.execute(questionReportQuery).pipe(
                    map((assessmentDetailsInDb:
                             LearnerAssessmentsEntry.QuestionReportsSchema[]) =>
                        SummarizerHandler.mapDBEntriesToQuestionReports(accuracyMap, assessmentDetailsInDb))
                );
            })
        );
    }

    getReportsByUser(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const query = SummarizerQueries.getReportsByUserQuery(request.uids, request.contentId);
        return this.dbService.execute(query).pipe(
            map((assesmentDetailsInDb: LearnerAssessmentsEntry.UserReportSchema[]) =>
                SummarizerHandler.mapDBEntriesToUserReports(assesmentDetailsInDb))
        );
    }

    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]> {
        if (!request.uids) {
            throw new ValidationError('uids are mandatory');
        }
        const query = SummarizerQueries.getChildProgressQuery(request.uids);
        return this.getContentCache(request.uids).pipe(
            mergeMap((cache: Map<string, ContentCache>) => {
                return this.dbService.execute(query).pipe(
                    map((assesmentsInDb: LearnerSummaryEntry.SchemaMap[]) =>
                        SummarizerHandler.mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb, cache))
                );
            })
        );
    }

    private getContentCache(uids: string[]): Observable<Map<string, ContentCache>> {
        if (this.contentMap && Object.keys(this.contentMap).length) {
            return of(this.contentMap);
        } else {
            this.contentMap = new Map<string, ContentCache>();
            const contentRequest: ContentRequest = {resourcesOnly: true, primaryCategories: [], uid: uids};
            return this.contenService.getContents(contentRequest).pipe(
                map((results: Content[]) => {
                    results.forEach(element => {
                        const cacheContent = new ContentCache();
                        cacheContent.name = element.contentData && element.contentData.name;
                        cacheContent.totalScore = element.contentData && element.contentData.totalScore;
                        cacheContent.lastUsedTime = element.lastUsedTime;
                        cacheContent.identifier = element.identifier;
                        this.contentMap.set(element.identifier, cacheContent);
                    });
                    return this.contentMap;
                })
            );
        }
    }

    saveLearnerAssessmentDetails(event: Telemetry): Observable<boolean> {
        const learnerAssesmentDetils: LearnerAssessmentDetails = SummarizerHandler.mapTelemetryToLearnerAssesmentDetails(event);
        const learnerAssessmentDbSchema: LearnerAssessmentsEntry.SchemaMap =
            SummarizerHandler.mapLearnerAssesmentDetailsToDbEntries(learnerAssesmentDetils);
        const filter = SummarizerQueries.getFilterForLearnerAssessmentDetails(learnerAssesmentDetils.qid, learnerAssesmentDetils.uid,
            learnerAssesmentDetils.contentId, learnerAssesmentDetils.hierarchyData);
        const query = SummarizerQueries.getLearnerAssessmentsQuery(filter);
        return this.dbService.execute(query).pipe(
            mergeMap((rows: LearnerAssessmentsEntry.SchemaMap[]) => {
                if (rows && rows.length) {
                    return this.dbService.update({
                        table: LearnerAssessmentsEntry.TABLE_NAME,
                        selection: SummarizerQueries.getUpdateSelection(),
                        selectionArgs: [learnerAssesmentDetils.uid,
                            learnerAssesmentDetils.contentId,
                            learnerAssesmentDetils.hierarchyData ? learnerAssesmentDetils.hierarchyData : '',
                            learnerAssesmentDetils.qid],
                        modelJson: learnerAssessmentDbSchema
                    }).pipe(
                        map(v => v > 0)
                    );

                } else {
                    if (learnerAssesmentDetils.qid) {
                        return this.dbService.insert({
                            table: LearnerAssessmentsEntry.TABLE_NAME,
                            modelJson: learnerAssessmentDbSchema
                        }).pipe(
                            map(v => v > 0)
                        );
                    }

                    return of(false);
                }
            })
        );
    }

    saveLearnerContentSummaryDetails(event: Telemetry): Observable<boolean> {
        const learnerContentSummaryDetails: LearnerContentSummaryDetails = SummarizerHandler.mapTelemetryToContentSummaryDetails(event);
        const learnerAssessmentDbSchema: LearnerSummaryEntry.SchemaMap =
            SummarizerHandler.mapContentSummaryDetailsToDbEntries(learnerContentSummaryDetails);
        return this.dbService.read({
            table: LearnerSummaryEntry.TABLE_NAME,
            selection: SummarizerQueries.getLearnerSummaryReadSelection(learnerContentSummaryDetails.hierarchyData),
            selectionArgs: [learnerContentSummaryDetails.uid,
                learnerContentSummaryDetails.contentId,
                learnerContentSummaryDetails.hierarchyData]
        }).pipe(
            mergeMap((rows: LearnerAssessmentsEntry.SchemaMap[]) => {
                if (rows && rows.length) {
                    learnerAssessmentDbSchema.sessions = rows[0][LearnerSummaryEntry.COLUMN_NAME_SESSIONS] + 1;
                    learnerAssessmentDbSchema.avg_ts = NumberUtil.toFixed(learnerContentSummaryDetails.timespent /
                        learnerContentSummaryDetails.sessions!);
                    learnerAssessmentDbSchema.total_ts = learnerContentSummaryDetails.timespent;
                    learnerAssessmentDbSchema.last_updated_on = learnerContentSummaryDetails.timestamp;
                    return this.dbService.update({
                        table: LearnerSummaryEntry.TABLE_NAME,
                        selection: SummarizerQueries.getLearnerSummaryReadSelection(learnerContentSummaryDetails.hierarchyData),
                        selectionArgs: [learnerContentSummaryDetails.uid,
                            learnerContentSummaryDetails.contentId,
                            learnerContentSummaryDetails.hierarchyData],
                        modelJson: learnerAssessmentDbSchema
                    }).pipe(
                        map(v => v > 0)
                    );

                } else {
                    learnerAssessmentDbSchema.avg_ts = learnerContentSummaryDetails.timespent;
                    learnerAssessmentDbSchema.sessions = 1;
                    learnerAssessmentDbSchema.total_ts = learnerContentSummaryDetails.timespent;
                    learnerAssessmentDbSchema.last_updated_on = learnerContentSummaryDetails.timestamp;
                    return this.dbService.insert({
                        table: LearnerSummaryEntry.TABLE_NAME,
                        modelJson: learnerAssessmentDbSchema
                    }).pipe(
                        map(v => v > 0)
                    );
                }
            })
        );
    }

    deletePreviousAssessmentDetails(uid: string, contentId: string): Observable<undefined> {
        return this.dbService.read({
            table: LearnerSummaryEntry.TABLE_NAME,
            selection: `${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerSummaryEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [contentId, uid]
        }).pipe(
            mergeMap((summariesinDb: LearnerSummaryEntry.SchemaMap[]) => {
                if (summariesinDb && summariesinDb.length) {
                    return this.dbService.delete({
                        table: LearnerSummaryEntry.TABLE_NAME,
                        selection: `${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerSummaryEntry.COLUMN_NAME_UID} = ?`,
                        selectionArgs: [contentId, uid]
                    });
                } else {
                    return of(undefined);
                }
            }),
            mergeMap(() => {
                return this.dbService.read({
                    table: LearnerAssessmentsEntry.TABLE_NAME,
                    selection: `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerAssessmentsEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [contentId, uid]
                });
            }),
            mergeMap((assesmentsInDb: LearnerAssessmentsEntry.SchemaMap[]) => {
                if (assesmentsInDb && assesmentsInDb.length) {
                    return this.dbService.delete({
                        table: LearnerAssessmentsEntry.TABLE_NAME,
                        selection: `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerAssessmentsEntry.COLUMN_NAME_UID} = ?`,
                        selectionArgs: [contentId, uid]
                    });
                } else {
                    return of(undefined);
                }
            })
        );
    }

    onEvent(event: TelemetryEvent): Observable<undefined> {
        if (event.type === TelemetryEventType.SAVE) {
            return this.summarizerTelemetryHandler.handle(event.payload);
        }

        return of(undefined);
    }
}
