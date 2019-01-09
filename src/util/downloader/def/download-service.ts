import {Observable} from 'rxjs';
import {DownloadProgress} from '../download-progress';

export interface DownloadService {

    enqueue(url: string, name?: string): Observable<DownloadProgress>;

    subscribeToProgress(url: string, intervalInSecs?: number): Observable<DownloadProgress>;

    unsubscribeToProgress(url: string): void;

}
