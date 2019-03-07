import {CorrelationData} from '../../../telemetry';

export interface DownloadRequest {
    downloadId?: string;
    identifier: string;
    downloadUrl: string;
    mimeType: string;
    destinationFolder: string;
    isChildContent?: boolean;
    correlationData?: CorrelationData[];
    filename: string;
    downloadedFilePath?: string;
}

export interface DownloadCancelRequest {
    identifier: string;
}
