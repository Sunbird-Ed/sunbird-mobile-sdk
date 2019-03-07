import {Observable} from 'rxjs';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from './request';
import {DownloadCompleteDelegate} from './download-complete-delegate';

export interface DownloadService extends SdkServiceOnInitDelegate {
    download(downloadRequest: DownloadRequest): Observable<undefined>;

    cancel(cancelRequest: DownloadCancelRequest): Observable<undefined>;

    /** @internal */
    registerDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void;
}
