import {DownloadService} from './def/download-service';
import {BehaviorSubject, Observable} from 'rxjs';
import {DownloadEventType, DownloadProgress} from './download-progress';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from './def/requests';
import {DownloadStatus} from './def/download-status';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {SharedPreferences} from '../shared-preferences';
import * as Collections from 'typescript-collections';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';
import {DownloadCompleteDelegate} from './def/download-complete-delegate';
import {DownloadKeys} from '../../preference-keys';

export class DownloadServiceImpl implements DownloadService, SdkServiceOnInitDelegate {
    private static readonly KEY_TO_DOWNLOAD_LIST = DownloadKeys.KEY_TO_DOWNLOAD_LIST;
    private static readonly DOWNLOAD_DIR_NAME = 'Download';

    private currentDownloadRequest$ = new BehaviorSubject<DownloadRequest | undefined>(undefined);

    private downloadCompleteDelegate?: DownloadCompleteDelegate;

    constructor(private eventsBusService: EventsBusService,
                private sharedPreferences: SharedPreferences) {
        window['downloadManager'] = downloadManagerInstance;
    }

    onInit(): Observable<undefined> {
        return this.listenForDownloadProgressesChanges();
    }

    download(downloadRequests: DownloadRequest[]): Observable<undefined> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest?: DownloadRequest) => {
                if (currentDownloadRequest) {
                    return this.addToDownloadList(downloadRequests);
                }

                return this.addToDownloadList(downloadRequests)
                    .do(async () => await this.switchToNextDownloadRequest().toPromise());
            });
    }

    cancel(downloadCancelRequest: DownloadCancelRequest): Observable<undefined> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest?: DownloadRequest) => {
                if (currentDownloadRequest && currentDownloadRequest.identifier === downloadCancelRequest.identifier) {
                    return Observable.create((observer) => {
                        downloadManager.remove([currentDownloadRequest.downloadId!], (err, removeCount) => {
                            if (err) {
                                observer.error(err);
                            }

                            observer.next(!!removeCount);
                            observer.complete();
                        });
                    })
                        .mergeMap(() => this.removeFromDownloadList(downloadCancelRequest))
                        .do(async () => await this.switchToNextDownloadRequest().toPromise());
                }

                return this.removeFromDownloadList(downloadCancelRequest);
            });
    }

    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void {
        this.downloadCompleteDelegate = downloadCompleteDelegate;
    }

    private switchToNextDownloadRequest(): Observable<undefined> {
        return this.getDownloadListAsSet()
            .mergeMap((downloadListAsSet: Collections.Set<DownloadRequest>) => {
                if (!downloadListAsSet.size()) {
                    return Observable.of(undefined)
                        .do(() => this.currentDownloadRequest$.next(undefined));
                }

                const anyDownloadRequest = downloadListAsSet.toArray().shift() as DownloadRequest;

                return Observable.create((observer) => {
                    downloadManager.enqueue({
                        uri: anyDownloadRequest.downloadUrl,
                        title: anyDownloadRequest.filename,
                        description: '',
                        mimeType: anyDownloadRequest.mimeType,
                        visibleInDownloadsUi: true,
                        notificationVisibility: 1,
                        destinationInExternalFilesDir: {
                            dirType: DownloadServiceImpl.DOWNLOAD_DIR_NAME,
                            subPath: anyDownloadRequest.filename
                        },
                        headers: []
                    }, (err, id: string) => {
                        if (err) {
                            return observer.error(err);
                        }

                        observer.next(id);
                    });
                }).do((downloadId) => {
                    anyDownloadRequest.downloadedFilePath = cordova.file.externalDataDirectory +
                        DownloadServiceImpl.DOWNLOAD_DIR_NAME + '/' + anyDownloadRequest.filename;
                    anyDownloadRequest.downloadId = downloadId;
                    this.currentDownloadRequest$.next(anyDownloadRequest);
                }).catch(() => {
                    return this.cancel({
                        identifier: anyDownloadRequest.identifier
                    });
                }) as Observable<undefined>;
            });
    }

    private addToDownloadList(requests: DownloadRequest[]): Observable<undefined> {
        return this.getDownloadListAsSet()
            .map((downloadRequests: Collections.Set<DownloadRequest>) => {
                requests.reduce((acc, request) => {
                    acc.add(request);
                    return acc;
                }, downloadRequests);

                return downloadRequests;
            })
            .mergeMap((downloadRequests: Collections.Set<DownloadRequest>) => {
                return this.sharedPreferences.putString(
                    DownloadServiceImpl.KEY_TO_DOWNLOAD_LIST,
                    JSON.stringify(downloadRequests.toArray())
                );
            });
    }

    private removeFromDownloadList(request: DownloadCancelRequest): Observable<undefined> {
        return this.getDownloadListAsSet()
            .mergeMap((downloadRequests: Collections.Set<DownloadRequest>) => {
                const toRemoveDownloadRequest = downloadRequests.toArray()
                    .find((downloadRequest) => downloadRequest.identifier === request.identifier);


                if (toRemoveDownloadRequest) {
                    downloadRequests.remove(toRemoveDownloadRequest);
                }

                return this.sharedPreferences.putString(
                    DownloadServiceImpl.KEY_TO_DOWNLOAD_LIST,
                    JSON.stringify(downloadRequests.toArray())
                );
            });
    }

    private getDownloadListAsSet(): Observable<Collections.Set<DownloadRequest>> {
        return this.sharedPreferences.getString(DownloadServiceImpl.KEY_TO_DOWNLOAD_LIST)
            .map((downloadListStringified?) => {
                if (!downloadListStringified) {
                    return [];
                }

                return (JSON.parse(downloadListStringified) as DownloadRequest[]);
            })
            .map((downloadRequests: DownloadRequest[]) => {
                return downloadRequests.reduce((acc, downloadRequest) => {
                    acc.add(downloadRequest);
                    return acc;
                }, new Collections.Set<DownloadRequest>((i) => Collections.util.makeString(i)));
            });
    }

    private handleDownloadCompletion(downloadProgress: DownloadProgress): Observable<undefined> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest) => {
                if (downloadProgress.payload.status === DownloadStatus.STATUS_SUCCESSFUL) {
                    return Observable.if(
                        () => !!this.downloadCompleteDelegate,
                        Observable.defer(() => this.downloadCompleteDelegate!.onDownloadCompletion(currentDownloadRequest!)),
                        Observable.defer(() => Observable.of(undefined))
                    ).mergeMap(() => this.cancel({identifier: currentDownloadRequest!.identifier}))
                        .catch(() => this.cancel({identifier: currentDownloadRequest!.identifier}));
                }

                return Observable.of(undefined);
            });
    }

    private emitProgressInEventBus(downloadProgress: DownloadProgress): Observable<undefined> {
        return Observable.defer(() => {
            return Observable.of(this.eventsBusService.emit({
                namespace: EventNamespace.DOWNLOADS,
                event: downloadProgress
            })).mapTo(undefined);
        });
    }

    private getDownloadProgress(downloadRequest: DownloadRequest): Observable<DownloadProgress> {
        return Observable.create((observer) => {
            downloadManager.query({ids: [downloadRequest.downloadId!]}, (err, entries) => {
                if (err) {
                    return observer.next({
                        type: DownloadEventType.PROGRESS,
                        payload: {
                            downloadId: downloadRequest.downloadId,
                            identifier: downloadRequest.identifier,
                            progress: -1,
                            status: DownloadStatus.STATUS_PENDING
                        }
                    } as DownloadProgress);
                    observer.complete();
                }

                const entry = entries[0];

                observer.next({
                    type: DownloadEventType.PROGRESS,
                    payload: {
                        downloadId: downloadRequest.downloadId,
                        identifier: downloadRequest.identifier,
                        progress: entry.totalSizeBytes >= 0 ? (entry.bytesDownloadedSoFar / entry.totalSizeBytes) * 100 : -1,
                        status: entry.status
                    }
                } as DownloadProgress);
                observer.complete();
            });
        });
    }

    private listenForDownloadProgressesChanges(): Observable<undefined> {
        return this.currentDownloadRequest$
            .switchMap((currentDownloadRequest: DownloadRequest | undefined) => {
                if (!currentDownloadRequest) {
                    return Observable.of(undefined);
                }

                return Observable.interval(1000)
                    .mergeMap(() => {
                        return this.getDownloadProgress(currentDownloadRequest);
                    })
                    .distinctUntilChanged((prev, next) =>
                        Collections.util.makeString(prev) === Collections.util.makeString(next))
                    .do((p) => console.log(p))
                    .mergeMap((downloadProgress) => {
                        return Observable.zip(
                            this.handleDownloadCompletion(downloadProgress!),
                            this.emitProgressInEventBus(downloadProgress!)
                        );
                    })
                    .mapTo(undefined);
            });
    }
}
