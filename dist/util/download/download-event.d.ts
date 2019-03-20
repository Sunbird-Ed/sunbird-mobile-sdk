import { DownloadStatus } from './def/download-status';
import { EventsBusEvent } from '../../events-bus';
export interface DownloadEvent extends EventsBusEvent {
    type: DownloadEventType;
}
export interface DownloadProgress extends DownloadEvent {
    payload: {
        downloadId: string;
        identifier: string;
        progress: number;
        status: DownloadStatus;
    };
}
export declare enum DownloadEventType {
    PROGRESS = "PROGRESS"
}
