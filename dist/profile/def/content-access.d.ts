export declare class ContentAccess {
    status: number;
    contentId: string;
    contentType: string;
    contentLearnerState: ContentLearnerState;
}
export interface ContentLearnerState {
    learnerState: {
        [key: string]: any;
    };
}
