import {SortOrder} from '../../content';
import {
    GetUserEnrolledCoursesRequest as CsGetUserEnrolledCoursesRequest,
    GetContentStateRequest as CsGetContentStateRequest,
    ContentState,
} from '@project-sunbird/client-services/services/course';
export {ContentState} from '@project-sunbird/client-services/services/course';
import {CachedItemRequest, CachedItemRequestSourceFrom} from '../../key-value-store';

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

export enum UpdateContentStateTarget {
    LOCAL = 'LOCAL',
    SERVER = 'SERVER'
}

export interface UpdateContentStateRequest {
    target?: UpdateContentStateTarget[];
    userId: string;
    courseId: string;
    contentId: string;
    batchId: string;
    result?: string;
    grade?: string;
    status?: ContentState['status'];
    progress?: ContentState['progress'];
    score?: ContentState['score'];
    bestScore?: ContentState['bestScore'];
}

export interface CourseBatchesRequest {
    filters: CourseBatchesRequestFilters;
    fields: string[];
    sort_by?: {[key: string]: SortOrder};
}

export interface UpdateContentStateAPIRequest {
    userId: string;
    contents: ContentState[];
}


export interface CourseBatchDetailsRequest {
    batchId: string;
}

export interface GetContentStateRequest extends CsGetContentStateRequest {
    returnRefreshedContentStates?: boolean;
}

export interface CourseBatchesRequestFilters {
    courseId: string[] | string;
    status?: string[];
    enrollmentType?: string;
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

export interface ContentStateResponse {
    contentList: ContentState[];
}

export interface GenerateAttemptIdRequest {
    courseId: string;
    batchId: string;
    contentId: string;
    userId: string;
    date?: number;
}

export interface GetUserEnrolledCoursesRequest {
    from?: CachedItemRequestSourceFrom;
    request: CsGetUserEnrolledCoursesRequest;
}

export interface DisplayDiscussionForumRequest {
    forumId: string;
}

export interface GetLearnerCerificateRequest extends CachedItemRequest {
    userId: string;
    size?: number;
}
