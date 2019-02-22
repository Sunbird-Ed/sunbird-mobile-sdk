export declare enum Status {
    UNKNOWN = -1,
    ENQUEUED = 0,
    STARTED = 1,
    COMPLETED = 2,
    FAILED = 3
}
export declare class DownloadProgress {
    private _id;
    private _progress;
    private _status;
    id: number;
    progress: number;
    status: Status;
}
