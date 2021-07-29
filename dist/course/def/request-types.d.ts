export interface FetchEnrolledCourseRequest {
    userId: string;
    returnFreshCourses?: boolean;
}
export interface EnrollCourseRequest {
    userId: string;
    courseId: string;
    batchId: string;
    batchStatus?: number;
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
    fields: string[];
}
export interface UpdateContentStateAPIRequest {
    userId: string;
    contents: ContentState[];
}
export interface CourseBatchDetailsRequest {
    batchId: string;
}
export interface GetContentStateRequest {
    userId: string;
    batchId: string;
    courseIds: string[];
    contentIds?: string[];
    returnRefreshedContentStates?: boolean;
}
export interface CourseBatchesRequestFilters {
    courseId: string[] | string;
    status?: string[];
    enrollmentType?: string;
    sortBy?: string;
}
export interface CourseBatchesRequestFilters {
    courseId: string[] | string;
    status?: string[];
    enrollmentType?: string;
    sortBy?: string;
}
export declare enum CourseEnrollmentType {
    OPEN = "open",
    INVITE_ONLY = "invite-only"
}
export declare enum CourseBatchStatus {
    NOT_STARTED = "0",
    IN_PROGRESS = "1",
    COMPLETED = "2"
}
export interface ContentState {
    lastAccessTime?: string;
    contentId?: string;
    batchId?: string;
    completedCount?: number;
    result?: string;
    score?: string;
    grade?: string;
    progress?: number;
    id?: string;
    viewCount?: number;
    contentVersion?: string;
    courseId?: string;
    lastCompletedTime?: string;
    status?: number;
}
export interface ContentStateResponse {
    contentList: ContentState[];
}
export interface GenerateAttemptIdRequest {
    courseId: string;
    batchId: string;
    contentId: string;
    userId: string;
}
