import { DownloadStatus } from './download-status';
import { EventsBusEvent } from '../../../events-bus';
export interface DownloadEvent extends EventsBusEvent {
    type: DownloadEventType;
}
export interface DownloadProgress extends DownloadEvent {
    payload: {
        downloadId: string;
        identifier: string;
        progress: number;
        status: DownloadStatus;
        bytesDownloaded: number;
        totalSizeInBytes: number;
    };
}
export declare enum DownloadEventType {
    START = "START",
    PROGRESS = "PROGRESS",
    END = "END"
}
