export enum Status {
    UNKNOWN = -1,
    ENQUEUED = 0,
    STARTED = 1,
    COMPLETED = 2,
    FAILED = 3
}

export class DownloadProgress {

    private _id: number;
    private _progress: number;
    private _status: Status;

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get progress(): number {
        return this._progress;
    }

    set progress(value: number) {
        this._progress = value;
    }

    get status(): Status {
        return this._status;
    }

    set status(value: Status) {
        this._status = value;
    }

}


