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

    courseId: string[] | string;

}

export interface CourseBatchDetailsRequest {

    batchId: string;

}
