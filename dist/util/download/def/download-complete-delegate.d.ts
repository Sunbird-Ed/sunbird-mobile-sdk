import { Observable } from 'rxjs';
import { DownloadRequest } from './requests';
export interface DownloadCompleteDelegate {
    onDownloadCompletion(downloadRequest: DownloadRequest): Observable<undefined>;
}
