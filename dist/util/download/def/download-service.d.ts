import { Observable } from 'rxjs';
import { SdkServiceOnInitDelegate } from '../../../sdk-service-on-init-delegate';
import { DownloadCancelRequest, DownloadRequest, TrackDownloadRequest } from './requests';
import { DownloadCompleteDelegate } from './download-complete-delegate';
import { ContentDeleteListener } from '../../../content/def/content-delete-listener';
import { DownloadTracking } from './response';
export interface DownloadService extends SdkServiceOnInitDelegate, ContentDeleteListener {
    download(downloadRequests: DownloadRequest[]): Observable<undefined>;
    cancel(cancelRequest: DownloadCancelRequest): Observable<undefined>;
    cancelAll(): Observable<void>;
    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void;
    getActiveDownloadRequests(): Observable<DownloadRequest[]>;
    trackDownloads(downloadStatRequest: TrackDownloadRequest): Observable<DownloadTracking>;
}
