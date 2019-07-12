import {DownloadManager} from '../def/download-manager';
import {injectable} from 'inversify';
import {Observable, Observer} from 'rxjs';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';

@injectable()
export class AndroidDownloadManager implements DownloadManager {
    constructor() {
        window['downloadManager'] = downloadManagerInstance;
    }

    enqueue(enqueueRequest: EnqueueRequest): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            downloadManager.enqueue(enqueueRequest, (err, id) => {
                if (err) {
                    observer.error(err);
                    return;
                }

                observer.next(id);
                observer.complete();
            });
        });
    }

    query(filter?: EnqueueFilter): Observable<EnqueuedEntry[]> {
        return Observable.create((observer: Observer<EnqueuedEntry[]>) => {
            downloadManager.query(filter, (err, entries) => {
                if (err) {
                    observer.error(err);
                    return;
                }

                observer.next(entries);
                observer.complete();
            });
        });
    }

    remove(ids: string[]): Observable<number> {
        return Observable.create((observer: Observer<number>) => {
            downloadManager.remove(ids, (err, removeCount) => {
                if (err) {
                    observer.error(err);
                    return;
                }

                observer.next(removeCount);
                observer.complete();
            });
        });
    }
}
