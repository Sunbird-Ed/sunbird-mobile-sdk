import { DownloadService } from './def/download-service';
import { Observable } from 'rxjs';
import { DownloadProgress } from './download-progress';
export declare class DownloadServiceImpl implements DownloadService {
    private static readonly KEY_PERSISTED_QUEUE;
    private downloadQueue;
    private intervalMap;
    constructor();
    private prepareQueue;
    enqueue(url: string, name?: string): Observable<DownloadProgress>;
    subscribeToProgress(url: string, intervalInSecs?: number): Observable<DownloadProgress>;
    unsubscribeToProgress(url: string): void;
}
