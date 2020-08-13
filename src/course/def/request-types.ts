import {SortOrder} from '../../content';
import {GetUserEnrolledCoursesRequest as CsGetUserEnrolledCoursesRequest} from '@project-sunbird/client-services/services/course';
import {CachedItemRequestSourceFrom} from '../../key-value-store';

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
    sort_by?: {[key: string]: SortOrder};
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
    courseId: string;
    contentIds?: string[];
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
    userId?: string;
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

export interface GetUserEnrolledCoursesRequest {
    from?: CachedItemRequestSourceFrom;
    request: CsGetUserEnrolledCoursesRequest;
}
