import {inject, injectable} from 'inversify';
import {DownloadManager} from '../def/download-manager';
import {Observable} from 'rxjs';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../..';

interface DownloadStat {
    percent: number,
    speed: number,
    size: {
        total: number,
        transferred: number
    };
    time: {
        elapsed: number,
        remaining: number
    };
}

@injectable()
export class ElectronDownloadManager implements DownloadManager {
    private downloadsMap: { [id: string]: any | undefined | 'done' } = {};
    private request;
    private progress;
    private fs;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        this.request = window['require']('request');
        this.progress = window['require']('request-progress');
        this.fs = window['require']('fs');
    }

    enqueue(enqueueRequest: EnqueueRequest): Observable<string> {
        this.downloadsMap[enqueueRequest.uri] = this.progress(enqueueRequest.uri, {
            throttle: 100,                    // Throttle the progress event to 2000ms, defaults to 1000ms
            // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
            // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
        });

        this.downloadsMap[enqueueRequest.uri].on('end', () => {
            this.downloadsMap[enqueueRequest.uri] = 'done';
        });

        this.downloadsMap[enqueueRequest.uri].pipe(this.fs.createWriteStream(this.sdkConfig.bootstrapConfig.rootDir + '/Download/' + enqueueRequest.destinationInExternalFilesDir!.subPath));

        return Observable.of(enqueueRequest.uri);
    }

    query(filter?: EnqueueFilter): Observable<EnqueuedEntry[]> {
        if (this.downloadsMap[filter!.ids![0]].progressState && this.downloadsMap[filter!.ids![0]] !== 'done') {
            const downloadStatus: DownloadStat = this.downloadsMap[filter!.ids![0]].progressState;

            return Observable.of([{
                id: filter!.ids![0],
                title: filter!.ids![0],
                description: '',
                mediaType: '',
                localFilename: '',
                localUri: '',
                mediaproviderUri: '',
                uri: '',
                lastModifiedTimestamp: Date.now(),
                status: 0x00000002,
                reason: 0,
                bytesDownloadedSoFar: downloadStatus.size.transferred,
                totalSizeBytes: downloadStatus.size.total
            }]);
        } else if (this.downloadsMap[filter!.ids![0]] === 'done') {
            return Observable.of([{
                id: filter!.ids![0],
                title: filter!.ids![0],
                description: '',
                mediaType: '',
                localFilename: '',
                localUri: '',
                mediaproviderUri: '',
                uri: '',
                lastModifiedTimestamp: Date.now(),
                status: 0x00000008,
                reason: 0,
                bytesDownloadedSoFar: 1,
                totalSizeBytes: 1
            }]);
        } else {
            return Observable.of([{
                id: filter!.ids![0],
                title: filter!.ids![0],
                description: '',
                mediaType: '',
                localFilename: '',
                localUri: '',
                mediaproviderUri: '',
                uri: '',
                lastModifiedTimestamp: Date.now(),
                status: 0x00000001,
                reason: 0,
                bytesDownloadedSoFar: 0,
                totalSizeBytes: 1
            }]);
        }
    }

    remove(ids: string[]): Observable<number> {
        if (this.downloadsMap[ids[0]] && this.downloadsMap[ids[0]] !== 'done') {
            this.downloadsMap[ids[0]].abort();
        }

        return Observable.of(1);
    }
}
