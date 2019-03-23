import { Course } from './course';
export interface GetEnrolledCourseResponse {
    id: string;
    params: {
        resmsgid: string;
    };
    result: {
        courses: Course[];
    };
}
