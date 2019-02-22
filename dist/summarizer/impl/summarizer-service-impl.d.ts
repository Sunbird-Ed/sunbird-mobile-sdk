import { SummarizerService } from '../def/summarizer-service';
import { Observable } from 'rxjs';
import { LearnerAssessmentDetails, LearnerAssessmentSummary } from '../def/response';
import { SummaryRequest } from '../def/request';
import { DbService } from '../../db';
import { TelemetryEvents } from '../../telemetry';
import Telemetry = TelemetryEvents.Telemetry;
export declare class SummarizerServiceImpl implements SummarizerService {
    private dbService;
    constructor(dbService: DbService);
    getDetailsPerQuestion(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getLearnerAssessmentDetails(request: SummaryRequest): Observable<LearnerAssessmentDetails[]>;
    getReportByQuestions(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getReportsByUser(request: SummaryRequest): Observable<{
        [p: string]: any;
    }[]>;
    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]>;
    saveLearnerAssessmentDetails(event: Telemetry): void;
    saveLearnerContentSummaryDetails(event: Telemetry): void;
}
