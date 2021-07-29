import { Observable } from 'rxjs';
import { SdkServiceOnInitDelegate } from '../../../sdk-service-on-init-delegate';
import { DownloadCancelRequest, DownloadRequest } from './requests';
import { DownloadCompleteDelegate } from './download-complete-delegate';
export interface DownloadService extends SdkServiceOnInitDelegate {
    download(downloadRequests: DownloadRequest[]): Observable<undefined>;
    cancel(cancelRequest: DownloadCancelRequest): Observable<undefined>;
    cancelAll(): Observable<void>;
    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void;
    getActiveDownloadRequests(): Observable<DownloadRequest[]>;
}
