import { LearnerAssessmentSummary, ReportDetailPerUser, SummarizerService, SummaryRequest } from '..';
import { DbService } from '../../db';
import { SunbirdTelemetry } from '../../telemetry';
import { EventsBusService } from '../../events-bus';
import { ContentService } from '../../content';
import { TelemetryEvent } from '../../telemetry/def/telemetry-event';
import { CourseService } from '../../course';
import { SharedPreferences } from '../../util/shared-preferences';
import { ProfileService } from '../../profile';
import { EventObserver } from '../../events-bus/def/event-observer';
import { Observable } from 'rxjs';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class SummarizerServiceImpl implements SummarizerService, EventObserver<TelemetryEvent> {
    private dbService;
    private contenService;
    private eventsBusService;
    private courseService;
    private sharedPreference;
    private profileService;
    private contentMap;
    private summarizerTelemetryHandler;
    constructor(dbService: DbService, contenService: ContentService, eventsBusService: EventsBusService, courseService: CourseService, sharedPreference: SharedPreferences, profileService: ProfileService);
    onInit(): Observable<undefined>;
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
    private getContentCache;
    saveLearnerAssessmentDetails(event: Telemetry): Observable<boolean>;
    saveLearnerContentSummaryDetails(event: Telemetry): Observable<boolean>;
    deletePreviousAssessmentDetails(uid: string, contentId: string): Observable<undefined>;
    onEvent(event: TelemetryEvent): Observable<undefined>;
}
