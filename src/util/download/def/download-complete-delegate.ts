import {Observable} from 'rxjs';
import {DownloadRequest} from './request';

export interface DownloadCompleteDelegate {
    onDownloadCompletion(downloadRequest: DownloadRequest): Observable<undefined>;
}
