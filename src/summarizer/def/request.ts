export interface SummaryRequest {
    qId: string;
    uids: string[];
    contentId: string;
    hierarchyData: string;
}

export interface DeleteAssessmentDetailsRequest {
    uid: string;
    contentId: string;
}
