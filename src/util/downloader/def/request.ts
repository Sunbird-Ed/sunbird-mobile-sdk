import {CorrelationData} from '../../../telemetry';

export interface DownloadRequest {
    downloadId?: number;
    identifier: string;
    downloadUrl: string;
    mimeType: string;
    destinationFolder: string;
    isChildContent?: boolean;
    correlationData?: CorrelationData[];
    filename?: string;
    downloadedFilePath?: string;
}
