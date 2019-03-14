import {DownloadStatus} from './def/download-status';

export interface DownloadProgress {
    downloadId: string;
    identifier: string;
    progress: number;
    status: DownloadStatus;
}
