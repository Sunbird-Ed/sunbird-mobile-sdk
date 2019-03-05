interface EnqueueRequest {
    uri: string;
    title: string;
    description: string;
    mimeType: string;
    visibleInDownloadsUi: boolean;
    notificationVisibility: number;

    // Either of the next three properties
    destinationInExternalFilesDir?: {
        dirType: string;
        subPath: string;
    };
    destinationInExternalPublicDir?: {
        dirType: string;
        subPath: string;
    };
    destinationUri?: string;

    headers: { [key: string]: string }[];
}

interface Entry {
    id: string;
    title: string;
    description: string;
    mediaType: string;
    localFilename: string;
    localUri: string;
    mediaproviderUri: string;
    uri: string;
    lastModifiedTimestamp: number;
    status: number;
    reason: number;
    bytesDownloadedSoFar: number;
    totalSizeBytes: number;
}


interface Window {
    downloadManager: {
        enqueue(req: EnqueueRequest, cb?: (err: any, idString: string) => void);
        query(filter: {
            ids: string[],
            status: number
        }[] | undefined, cb: (err: any, entry: Entry[]) => void);
        remove(ids: string[], cb?: (err, removedCount) => void);
    };
}
