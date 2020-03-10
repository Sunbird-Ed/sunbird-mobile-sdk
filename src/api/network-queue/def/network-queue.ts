import {Request as NetworkRequest} from '../..';

export enum NetworkQueueRequestType {
    TELEMETRY_EVENTS_SYNC = 'TELEMETRY_EVENTS_SYNC'
}

export interface NetworkQueueRequest {
    id?: number;
    type: string;
    priority: number;
    ts: number;
    networkRequest: NetworkRequest;
}

export interface NetworkQueue {
    enqueue(request: NetworkQueueRequest): void;
    dequeue(): NetworkQueueRequest | undefined;
    peek(): NetworkQueueRequest | undefined;
}
