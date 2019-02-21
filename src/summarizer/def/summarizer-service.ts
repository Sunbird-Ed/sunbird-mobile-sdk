import {Observable} from 'rxjs';
import {LearnerAssessmentDetails, LearnerAssessmentSummary} from './response';
import {SummaryRequest} from './request';
import {TelemetryEvents} from '../../telemetry';
import Telemetry = TelemetryEvents.Telemetry;


export interface SummarizerService {
    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]>;

    getLearnerAssessmentDetails(request: SummaryRequest): Observable<LearnerAssessmentDetails[]>;

    saveLearnerAssessmentDetails(event: Telemetry);

    saveLearnerContentSummaryDetails(event: Telemetry);

    getReportsByUser(request: SummaryRequest): Observable<{ [key: string]: any }[]>;

    getReportByQuestions(request: SummaryRequest): Observable<{ [key: string]: any }[]>;

    getDetailsPerQuestion(request: SummaryRequest): Observable<{ [key: string]: any }[]>;
}


