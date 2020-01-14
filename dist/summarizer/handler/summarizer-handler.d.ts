import { LearnerAssessmentsEntry, LearnerSummaryEntry } from '../../profile/db/schema';
import { ContentCache, LearnerAssessmentDetails, LearnerAssessmentSummary, LearnerContentSummaryDetails, QuestionSummary, ReportDetailPerUser, UserReportSummary } from '..';
import { SunbirdTelemetry } from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class SummarizerHandler {
    constructor();
    static mapLearnerAssesmentDetailsToDbEntries(learnerAssessmentDetails: LearnerAssessmentDetails): LearnerAssessmentsEntry.SchemaMap;
    static mapContentSummaryDetailsToDbEntries(learnerContentSummaryDetails: LearnerContentSummaryDetails): LearnerSummaryEntry.SchemaMap;
    static mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb: LearnerSummaryEntry.SchemaMap[], cache: Map<string, ContentCache>): LearnerAssessmentSummary[];
    static mapDBEntriesToLearnerAssesmentDetails(assesmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]): Map<string, ReportDetailPerUser>;
    static mapDBEntriesToQuestionReports(accuracyMap: {
        [p: string]: any;
    }, questionReportsInDb: LearnerAssessmentsEntry.QuestionReportsSchema[]): LearnerAssessmentDetails[];
    static mapDBEntriesToAccuracy(accuracyReportsInDb: LearnerAssessmentsEntry.AccuracySchema[]): {
        [key: string]: string;
    };
    static mapDBEntriesToQuestionDetails(questionSummaries: QuestionSummary[]): QuestionSummary[];
    static mapDBEntriesToUserReports(userReportsInDb: LearnerAssessmentsEntry.UserReportSchema[]): UserReportSummary[];
    static mapTelemetryToContentSummaryDetails(telemetry: Telemetry): LearnerContentSummaryDetails;
    static mapTelemetryToLearnerAssesmentDetails(telemetry: Telemetry): LearnerAssessmentDetails;
    private static getHierarchyData;
}
