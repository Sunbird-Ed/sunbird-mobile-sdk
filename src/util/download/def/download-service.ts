import {Observable} from 'rxjs';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from './requests';
import {DownloadCompleteDelegate} from './download-complete-delegate';
import {AppStorageInfo} from './app-storage-info';

export interface DownloadService extends SdkServiceOnInitDelegate {
    download(downloadRequests: DownloadRequest[]): Observable<undefined>;

    cancel(cancelRequest: DownloadCancelRequest): Observable<undefined>;

    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void;

    getAppStorageInfo(): Observable<AppStorageInfo>;

    getActiveDownloadRequests(): Observable<DownloadRequest[]>;
}
