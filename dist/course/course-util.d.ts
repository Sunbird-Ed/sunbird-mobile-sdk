import { UpdateContentStateAPIRequest, UpdateContentStateRequest } from './def/request-types';
export declare class CourseUtil {
    static getUpdateContentStateRequest(updateContentReq: UpdateContentStateRequest): UpdateContentStateAPIRequest;
    static getUpdateContentStateListRequest(userId: string, updateContentReqList: UpdateContentStateRequest[]): UpdateContentStateAPIRequest;
    private static getRequestMap;
}
