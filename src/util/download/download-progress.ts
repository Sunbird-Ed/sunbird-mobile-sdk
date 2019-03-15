import {DownloadStatus} from './def/download-status';
import {EventBusEvent} from '../../events-bus/def/event-bus-event';

export interface DownloadEvent extends EventBusEvent {
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
