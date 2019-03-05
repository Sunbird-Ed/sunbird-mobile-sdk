import {CorrelationData} from '../../../telemetry';

export interface DownloadRequest {
    identifier: string;
    downloadUrl: string;
    mimeType: string;
    destinationFolder: string;
    isChildContent?: boolean;
    correlationData?: CorrelationData[];
    filename?: string;
    downloadedFilePath?: string;
}

export interface DownloadRemoveRequest {
    downloadId: number;
}
