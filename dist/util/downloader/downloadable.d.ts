import { Comparator } from '../list/comparator';
export declare class Downloadable implements Comparator<Downloadable> {
    private _id;
    private _url;
    private _name;
    private _downloadedPath;
    id: number;
    url: string;
    name: string;
    downloadedPath: string;
    isEqual(v: Downloadable): boolean;
}
