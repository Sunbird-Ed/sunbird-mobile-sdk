import {Comparator} from '../list/comparator';

export class Downloadable implements Comparator<Downloadable> {

    private _id: number;
    private _url: string;
    private _name: string;
    private _downloadedPath: string;

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get downloadedPath(): string {
        return this._downloadedPath;
    }

    set downloadedPath(value: string) {
        this._downloadedPath = value;
    }

    isEqual(v: Downloadable): boolean {
        return v._url === this._url;
    }
}
