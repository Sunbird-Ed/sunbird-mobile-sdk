import { DownloadService } from './def/download-service';
import { Observable } from 'rxjs';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
import { DownloadCancelRequest, DownloadRequest } from './def/requests';
import { EventsBusService } from '../../events-bus';
import { SharedPreferences } from '../shared-preferences';
import { DownloadCompleteDelegate } from './def/download-complete-delegate';
export declare class DownloadServiceImpl implements DownloadService, SdkServiceOnInitDelegate {
    private eventsBusService;
    private sharedPreferences;
    private static readonly KEY_TO_DOWNLOAD_LIST;
    private static readonly DOWNLOAD_DIR_NAME;
    private currentDownloadRequest$;
    private downloadCompleteDelegate?;
    constructor(eventsBusService: EventsBusService, sharedPreferences: SharedPreferences);
    onInit(): Observable<undefined>;
    download(downloadRequests: DownloadRequest[]): Observable<undefined>;
    cancel(downloadCancelRequest: DownloadCancelRequest): Observable<undefined>;
    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void;
    private switchToNextDownloadRequest;
    private addToDownloadList;
    private removeFromDownloadList;
    private getDownloadListAsSet;
    private handleDownloadCompletion;
    private emitProgressInEventBus;
    private getDownloadProgress;
    private listenForDownloadProgressChanges;
}
