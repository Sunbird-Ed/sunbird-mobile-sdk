export interface FetchEnrolledCourseRequest {
    userId: string;
}

export interface EnrollCourseRequest {
    userId: string;
    courseId: string;
    contentId: string;
    batchId: string;
}


export interface UpdateContentStateRequest {
    userId: string;
    courseId: string;
    contentId: string;
    batchId: string;
    status?: number;
    progress?: number;
    result?: string;
    grade?: string;
    score?: string;
}

export interface CourseBatchesRequest {
    filters: CourseBatchesRequestFilters;
}

export interface CourseBatchDetailsRequest {
    batchId: string;
}

export interface GetContentStateRequest {
    userId: string;
    batchId: string;
    courseIds: string[];
    contentIds: string[];
    returnRefreshedContentStates: boolean;
}

export interface CourseBatchesRequestFilters {
    courseId: string[] | string;
    status?: string[];
    enrollmentType?: string;
    sortBy?: string;
}

export enum CourseEnrollmentType {
    OPEN = 'open',
    INVITE_ONLY = 'invite-only'
}

export enum CourseBatchStatus {
    NOT_STARTED = '0',
    IN_PROGRESS = '1',
    COMPLETED = '2'
}
