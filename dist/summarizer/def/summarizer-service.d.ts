import { Observable } from 'rxjs';
import { LearnerAssessmentDetails, LearnerAssessmentSummary } from './response';
import { SummaryRequest } from './request';
export interface SummarizerService {
    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]>;
    getLearnerAssessmentDetails(request: SummaryRequest): Observable<LearnerAssessmentDetails[]>;
    saveLearnerAssessmentDetails(): any;
    saveLearnerContentSummaryDetails(): any;
    getReportsByUser(request: SummaryRequest): Observable<{
        [key: string]: any;
    }[]>;
    getReportByQuestions(request: SummaryRequest): Observable<{
        [key: string]: any;
    }[]>;
    getDetailsPerQuestion(request: SummaryRequest): Observable<{
        [key: string]: any;
    }[]>;
}
