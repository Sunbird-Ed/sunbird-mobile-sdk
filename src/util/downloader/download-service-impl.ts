import {Queue} from '../queue/queue';
import {Downloadable} from './downloadable';
import {LinkedList} from '../list/linked-list';
import {DownloadService} from './def/download-service';
import {Observable, Subject} from 'rxjs';
import {DownloadProgress, Status} from './download-progress';

declare var DownloadManager: {
    download: (
        downloadable: { url: string, name: string },
        success: (downloadable: { id: number, url: string, name: string, downloadedPath: string }) => void,
        error: (err) => void
    ) => void;

    getProgress: (
        id: number,
        success: (progress: { id: number, progress: number, status: number }) => void,
        error: (err) => void
    ) => void;

    cancel: (id: number) => void;

    listenProgress: (id: number, listener: (progress: { id: number, progress: number, status: number }) => void) => void;
};

export class DownloadServiceImpl implements DownloadService {

    private static readonly KEY_PERSISTED_QUEUE = 'key_persisted_queue';

    private downloadQueue: Queue<Downloadable>;
    private intervalMap: Map<string, number>;

    constructor() {
        this.intervalMap = new Map<string, number>();
        this.prepareQueue();
    }

    private prepareQueue() {
        const persistedJson = localStorage.getItem(DownloadServiceImpl.KEY_PERSISTED_QUEUE);
        if (persistedJson != null) {
            this.downloadQueue = LinkedList.fromJson(persistedJson) as Queue<Downloadable>;
        } else {
            this.downloadQueue = new Queue();
        }
    }

    enqueue(url: string, name?: string): Observable<DownloadProgress> {
        const obserable = new Subject<DownloadProgress>();

        const downloadable = new Downloadable();
        downloadable.url = url;
        downloadable.name = name!;

        DownloadManager.download(downloadable, value => {
            downloadable.id = value.id;
            downloadable.downloadedPath = value.downloadedPath;
            this.downloadQueue.enque(downloadable);

            // get progress and publish the result immediately
            DownloadManager.getProgress(downloadable.id, p => {
                const downloadProgress = new DownloadProgress();
                downloadProgress.id = p.id;
                downloadProgress.progress = p.progress;
                downloadProgress.status = p.status;
                obserable.next(downloadProgress);
                obserable.complete();
            }, e => {
                obserable.error(e);
            });

        }, err => {
            obserable.error(err);
        });

        return obserable;
    }

    subscribeToProgress(url: string, intervalInSecs = 10): Observable<DownloadProgress> {
        const obserable = new Subject<DownloadProgress>();

        let downloadable;

        this.downloadQueue.forEach((d: Downloadable) => {
            if (d.url === url) {
                downloadable = d;
            }
        });

        if (downloadable == null) {
            obserable.error('Not found');
        }

        const interval = setInterval(() => {
            DownloadManager.getProgress(downloadable.id, p => {
                const downloadProgress = new DownloadProgress();
                downloadProgress.id = p.id;
                downloadProgress.progress = p.progress;
                downloadProgress.status = p.status;
                obserable.next(downloadProgress);

                if (p.status !== Status.STARTED) {
                    clearInterval(this.intervalMap.get(url));
                }
            }, e => {
                obserable.error(e);
            });
        }, intervalInSecs * 1000);
        this.intervalMap.set(url, interval);

        return obserable;
    }

    unsubscribeToProgress(url: string): void {
        const interval = this.intervalMap.get(url);
        if (interval !== null) {
            clearInterval(interval);
        }
    }


}
