import { Request as NetworkRequest } from '../..';
import { Observable } from 'rxjs';
export declare enum NetworkQueueType {
    TELEMETRY = "telemetry",
    COURSE_PROGRESS = "course_progress",
    COURSE_ASSESMENT = "course_assesment"
}
export interface NetworkQueueRequest {
    msgId: string;
    priority: number;
    ts: number;
    data: any;
    itemCount: number;
    config: string;
    type: NetworkQueueType;
    networkRequest: NetworkRequest;
}
export interface NetworkQueue {
    enqueue(networkRequest: NetworkQueueRequest, shouldSync: boolean): Observable<undefined>;
}
