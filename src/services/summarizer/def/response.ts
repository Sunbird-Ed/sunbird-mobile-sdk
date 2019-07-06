export interface LearnerAssessmentSummary {
    uid: string;
    contentId: string;
    noOfQuestions: number;
    correctAnswers: number;
    totalTimespent: number;
    hierarchyData: string;
    totalQuestionsScore: number;
    totalMaxScore: number;
    totalScore: number;
    name?: string;
    lastUsedTime?: number;
}



export interface LearnerAssessmentDetails {
    id?: number;
    uid: string;
    contentId: string;
    qid: string;
    qindex: number;
    correct: number;
    score: number;
    timespent: number;
    res: string;
    timestamp: number;
    qdesc: string;
    qtitle: string;
    maxScore: number;
    hierarchyData: string;
    total_ts?: number;
    marks?: number;
    occurenceCount?: number;
    sum_max_score?: number;
    correct_users_count?: number;

}

export interface LearnerContentSummaryDetails {
    uid: string;
    contentId: string;
    avgts?: number;
    sessions?: number;
    totalts?: number;
    lastUpdated?: number;
    timespent: number;
    timestamp: number;
    ver?: string;
    hierarchyData: string;
}

export interface QuestionSummary {
    uid: string;
    time: number;
    result: number;
    max_score: number;
}

export interface UserReportSummary {
    totalTimespent: number;
    score: number;
    hData: string;
    contentId: string;
    uid: string;
    userName: string;
    timespent: number;
}

export class ContentCache {
    lastUsedTime: number;
    name: string;
    identifier: string;
    totalScore: number;
}

export class ReportDetailPerUser {
    uid: string;
    name: string;
    totalTime: number;
    totalScore: number;
    maxTotalScore: number;
    totalMaxScore: number;
    totalQuestionsScore: number;
    reportDetailsList: LearnerAssessmentDetails[] = [];
}

