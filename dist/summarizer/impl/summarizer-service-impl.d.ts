import { ContentCache, LearnerAssessmentSummary, ReportDetailPerUser, SummarizerService, SummaryRequest } from '..';
import { Observable } from 'rxjs';
import { DbService } from '../../db';
import { SunbirdTelemetry } from '../../telemetry';
import { EventsBusService } from '../../events-bus';
import { EventObserver } from '../../events-bus/def/event-observer';
import { ContentService } from '../../content';
import { TelemetryEvent } from '../../telemetry/def/telemetry-event';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class SummarizerServiceImpl implements SummarizerService, EventObserver<TelemetryEvent> {
    private dbService;
    private contenService;
    private eventsBusService;
    private contentMap;
    constructor(dbService: DbService, contenService: ContentService, eventsBusService: EventsBusService);
    getDetailsPerQuestion(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getLearnerAssessmentDetails(request: SummaryRequest): Observable<Map<string, ReportDetailPerUser>>;
    getReportByQuestions(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getReportsByUser(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]>;
    getContentCache(): Observable<Map<string, ContentCache>>;
    saveLearnerAssessmentDetails(event: Telemetry): Observable<boolean>;
    saveLearnerContentSummaryDetails(event: Telemetry): Observable<boolean>;
    deletePreviousAssessmentDetails(uid: string, contentId: string): Observable<undefined>;
    onEvent(event: TelemetryEvent): Observable<undefined>;
}
