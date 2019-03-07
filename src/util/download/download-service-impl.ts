import {DownloadService} from './def/download-service';
import {Observable} from 'rxjs';
import {DownloadProgress} from './download-progress';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from './def/request';
import {DownloadStatus} from './def/download-status';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {SharedPreferences} from '../shared-preferences';
import * as Collections from 'typescript-collections';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';
import {DownloadCompleteDelegate} from './def/download-complete-delegate';

export class DownloadServiceImpl implements DownloadService, SdkServiceOnInitDelegate {
    private static readonly KEY_CURRENT_DOWNLOAD_REQUEST = 'current_download_request';
    private static readonly KEY_TO_DOWNLOAD_LIST = 'to_download_list';

    private downloadCompleteDelegate?: DownloadCompleteDelegate;

    constructor(private eventsBusService: EventsBusService,
                private sharedPreferences: SharedPreferences) {
        window['downloadManager'] = downloadManagerInstance;
    }

    onInit(): Observable<undefined> {
        return this.listenToAllDownloadProgresses();
    }

    download(downloadRequest: DownloadRequest): Observable<undefined> {
        return this.addToDownloadList(downloadRequest)
            .mergeMap(() => this.resume());
    }

    cancel(downloadCancelRequest: DownloadCancelRequest): Observable<undefined> {
        return this.getCurrentDownloadRequest()
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
                    }).mergeMap(() => this.sharedPreferences.putString(DownloadServiceImpl.KEY_CURRENT_DOWNLOAD_REQUEST, ''))
                        .mergeMap(() => this.removeFromDownloadList(downloadCancelRequest));
                }

                return this.removeFromDownloadList(downloadCancelRequest);
            })
            .mergeMap(() => this.resume());
    }

    registerDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void {
        this.downloadCompleteDelegate = downloadCompleteDelegate;
    }

    private resume(): Observable<undefined> {
        return this.getDownloadListAsSet()
            .mergeMap((downloadListAsSet: Collections.Set<DownloadRequest>) => {
                if (!downloadListAsSet.size()) {
                    return Observable.of(undefined);
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
                            dirType: 'Download',
                            subPath: anyDownloadRequest.filename
                        },
                        headers: []
                    }, (err, id) => {
                        if (err) {
                            return observer.error(err);
                        }

                        observer.next(id);
                    });
                }).mergeMap((downloadId) => {
                    anyDownloadRequest.downloadId = downloadId;

                    return this.sharedPreferences.putString(
                        DownloadServiceImpl.KEY_CURRENT_DOWNLOAD_REQUEST, JSON.stringify(anyDownloadRequest)
                    );
                });
            });
    }

    private addToDownloadList(request: DownloadRequest): Observable<undefined> {
        return this.getDownloadListAsSet()
            .do((downloadRequests: Collections.Set<DownloadRequest>) => {
                downloadRequests.add(request);
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

    private downloadProgress$({identifier, downloadId}: DownloadRequest): Observable<DownloadProgress | undefined> {
        return Observable.create((observer) => {
            downloadManager.query({ids: [downloadId!]}, (err, entries) => {
                if (err) {
                    return observer.error(err);
                }

                const entry = entries[0];

                observer.next({
                    downloadId,
                    identifier,
                    progress: (entry.bytesDownloadedSoFar / entry.totalSizeBytes) * 100,
                    status: entry.status
                });
            });
        });
    }

    private getCurrentDownloadRequest(): Observable<DownloadRequest | undefined> {
        return this.sharedPreferences.getString(DownloadServiceImpl.KEY_CURRENT_DOWNLOAD_REQUEST)
            .map((stringifiedRequest) => {
                if (!stringifiedRequest) {
                    return undefined;
                }

                return JSON.parse(stringifiedRequest);
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

    private handleDownloadCompletion(currentDownloadRequest: DownloadRequest, downloadProgress: DownloadProgress): Observable<undefined> {
        if (downloadProgress.progress === DownloadStatus.STATUS_SUCCESSFUL) {
            return Observable.if(
                () => !!this.downloadCompleteDelegate,
                Observable.defer(() => this.downloadCompleteDelegate!.onDownloadCompletion(currentDownloadRequest)),
                Observable.defer(() => Observable.of(undefined))
            ).mergeMap(() => this.cancel({identifier: currentDownloadRequest.identifier}));
        }

        return Observable.of(undefined);
    }

    private emitProgressInEventBus(downloadProgress: DownloadProgress): Observable<undefined> {
        return Observable.defer(() => {
            return Observable.of(this.eventsBusService.emit({
                namespace: EventNamespace.DOWNLOADS,
                event: downloadProgress
            })).mapTo(undefined);
        });
    }

    private listenToAllDownloadProgresses(): Observable<undefined> {
        return Observable.interval(1000)
            .mergeMap(() => {
                return this.getCurrentDownloadRequest();
            })
            .mergeMap((currentDownloadRequest?) => {
                if (!currentDownloadRequest) {
                    return Observable.of(undefined);
                }

                return this.downloadProgress$(currentDownloadRequest)
                    .filter((downloadProgress?) => {
                        return !!downloadProgress;
                    })
                    .distinctUntilChanged((prevDownloadProgress, newDownloadProgress) => {
                        return Collections.util.makeString(prevDownloadProgress) === Collections.util.makeString(newDownloadProgress);
                    })
                    .do((downloadProgress) => console.log(downloadProgress))
                    .mergeMap((downloadProgress) => {
                        return Observable.zip(
                            this.handleDownloadCompletion(currentDownloadRequest, downloadProgress!),
                            this.emitProgressInEventBus(downloadProgress!)
                        );
                    })
                    .mapTo(undefined);
            });
    }
}
