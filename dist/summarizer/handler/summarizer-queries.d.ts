export declare class SummarizerQueries {
    static getChildProgressQuery(uids: string[]): string;
    static getContentProgressQuery(contentId: string): string;
    static getDetailReportsQuery(uids: string[], contentId: string): string;
    static getReportsByUserQuery(uids: string[], contentId: string): string;
    static getQuetsionDetailsQuery(uids: string[], contentId: string, qid: string): string;
    static getReportAccuracyQuery(uids: string[], contentId: string): string;
    static getQuestionReportsQuery(uids: string[], contentId: string): string;
    static getFilterForLearnerAssessmentDetails(qid: string, uid: string, contentId: string, hierarchyData: string): string;
    static getLearnerAssessmentsQuery(filter: string): string;
    static getUpdateSelection(): string;
    static getLearnerSummaryReadSelection(hData: string): string;
}
