import { LearnerAssessmentsEntry, LearnerSummaryEntry } from '../../profile/db/schema';
import { LearnerAssessmentDetails, LearnerAssessmentSummary, QuestionSummary, UserReportSummary } from '../def/response';
export declare class SummarizerHandler {
    static getChildProgressQuery(uids: string[]): string;
    static getContentProgressQuery(contentId: string): string;
    static getDetailReportsQuery(uids: string[], contentId: string): string;
    static getReportsByUserQuery(uids: string[], contentId: string): string;
    static getQuetsionDetailsQuery(uids: string[], contentId: string, qid: string): string;
    static getReportAccuracyQuery(uids: string[], contentId: string): string;
    static getQuestionReportsQuery(uids: string[], contentId: string): string;
    static mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb: LearnerSummaryEntry.SchemaMap[]): LearnerAssessmentSummary[];
    static mapDBEntriesToLearnerAssesmentDetails(assesmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]): LearnerAssessmentDetails[];
    static mapDBEntriesToQuestionReports(accuracyMap: {
        [p: string]: any;
    }, questionReportsInDb: LearnerAssessmentsEntry.QuestionReportsSchema[]): LearnerAssessmentDetails[];
    static mapDBEntriesToAccuracy(accuracyReportsInDb: LearnerAssessmentsEntry.AccuracySchema[]): {
        [key: string]: string;
    };
    static mapDBEntriesToQuestionDetails(questionSummaries: QuestionSummary[]): QuestionSummary[];
    static mapDBEntriesToUserReports(userReportsInDb: LearnerAssessmentsEntry.UserReportSchema[]): UserReportSummary[];
}
