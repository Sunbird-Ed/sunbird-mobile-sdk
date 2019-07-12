import {Observable} from 'rxjs';

export interface DownloadManager {
    enqueue(enqueueRequest: EnqueueRequest): Observable<string>;

    query(filter?: EnqueueFilter): Observable<EnqueuedEntry[]>;

    remove(ids: string[]): Observable<number>;
}
