import {SummarizerService} from '../def/summarizer-service';
import {Observable} from 'rxjs';
import {LearnerAssessmentDetails, LearnerAssessmentSummary, QuestionSummary} from '../def/response';
import {SummaryRequest} from '../def/request';
import {SummarizerHandler} from '../handler/summarizer-handler';
import {DbService} from '../../db';
import {LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {TelemetryEvents} from '../../telemetry';
import Telemetry = TelemetryEvents.Telemetry;

export class SummarizerServiceImpl implements SummarizerService {

    constructor(private dbService: DbService) {
    }

    getDetailsPerQuestion(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const query = SummarizerHandler.getQuetsionDetailsQuery(request.uids, request.contentId, request.qId);
        return this.dbService.execute(query).map((questionSummaries: QuestionSummary[]) =>
            SummarizerHandler.mapDBEntriesToQuestionDetails(questionSummaries));
    }

    getLearnerAssessmentDetails(request: SummaryRequest): Observable<LearnerAssessmentDetails[]> {
        const query = SummarizerHandler.getDetailReportsQuery(request.uids, request.contentId);
        return this.dbService.execute(query).map((assesmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]) =>
            SummarizerHandler.mapDBEntriesToLearnerAssesmentDetails(assesmentDetailsInDb));
    }

    getReportByQuestions(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const questionReportQuery = SummarizerHandler.getQuetsionDetailsQuery(request.uids, request.contentId, request.qId);
        const accuracyQuery = SummarizerHandler.getReportAccuracyQuery(request.uids, request.contentId);
        return this.dbService.execute(accuracyQuery).map((accuracyReports: LearnerAssessmentsEntry.AccuracySchema[]) =>
            SummarizerHandler.mapDBEntriesToAccuracy(accuracyReports)).mergeMap((accuracyMap: { [p: string]: any }) => {
            return this.dbService.execute(questionReportQuery).map((assesmentDetailsInDb:
                                                                        LearnerAssessmentsEntry.QuestionReportsSchema[]) =>
                SummarizerHandler.mapDBEntriesToQuestionReports(accuracyMap, assesmentDetailsInDb));
        });
    }

    getReportsByUser(request: SummaryRequest): Observable<{ [p: string]: any }[]> {
        const query = SummarizerHandler.getReportsByUserQuery(request.uids, request.contentId);
        return this.dbService.execute(query).map((assesmentDetailsInDb: LearnerAssessmentsEntry.UserReportSchema[]) =>
            SummarizerHandler.mapDBEntriesToUserReports(assesmentDetailsInDb));
    }

    getSummary(request: SummaryRequest): Observable<LearnerAssessmentSummary[]> {
        let query;
        if (request.uids) {
            query = SummarizerHandler.getChildProgressQuery(request.uids);
        } else if (request.contentId) {
            query = SummarizerHandler.getContentProgressQuery(request.contentId);
        }
        return this.dbService.execute(query).map((assesmentsInDb: LearnerSummaryEntry.SchemaMap[]) =>
            SummarizerHandler.mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb));
    }

    saveLearnerAssessmentDetails(event: Telemetry) {
    }

    saveLearnerContentSummaryDetails(event: Telemetry) {
    }

}
