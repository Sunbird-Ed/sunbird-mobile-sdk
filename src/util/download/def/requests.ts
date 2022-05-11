export interface DownloadRequest {
    withPriority?: number;
    downloadId?: string;
    title?: string;
    identifier: string;
    downloadUrl: string;
    mimeType: string;
    destinationFolder: string;
    filename: string;
    downloadedFilePath?: string;
}

export interface DownloadCancelRequest {
    identifier: string;
}

export interface TrackDownloadRequest {
    groupBy: {
        fieldPath: string,
        value: any
    };
}
