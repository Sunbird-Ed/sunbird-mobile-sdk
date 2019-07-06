import {DownloadStatus} from './download-status';
import {EventsBusEvent} from '../../../services/events-bus';

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

export enum DownloadEventType {
    PROGRESS = 'PROGRESS'
}
