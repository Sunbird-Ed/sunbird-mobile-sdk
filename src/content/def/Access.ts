export interface Access {
    status: number;
    contentId: string;
    contentLearnerState: LearnerState;
}

export interface LearnerState {
    learnerState: { [key: string]: any };
}
