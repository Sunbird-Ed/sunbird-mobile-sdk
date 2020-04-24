import {Request as NetworkRequest} from '../..';
import {Observable} from 'rxjs';

export interface NetworkQueueRequest {
  msgId: string;
  priority: number;
  ts: number;
  data: any;
  itemCount: number;
  config: string;
  networkRequest: NetworkRequest;
}

export interface NetworkQueue {
  enqueue(networkRequest: NetworkQueueRequest, shouldSync: boolean): Observable<undefined>;
}
