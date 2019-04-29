import {DownloadService} from './def/download-service';
import {BehaviorSubject, Observable} from 'rxjs';
import {DownloadEventType, DownloadProgress} from './download-event';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from './def/requests';
import {DownloadStatus} from './def/download-status';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {SharedPreferences} from '../shared-preferences';
import * as Collections from 'typescript-collections';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';
import {DownloadCompleteDelegate} from './def/download-complete-delegate';
import {DownloadKeys} from '../../preference-keys';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';
import {InteractSubType, InteractType, ObjectType} from '../../telemetry';
import { AppStorageInfo } from './def/app-storage-info';
import { ContentDownloadRequest } from '../../content';

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
        return this.listenForDownloadProgressChanges();
    }

    download(downloadRequests: DownloadRequest[]): Observable<undefined> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest?: DownloadRequest) => {
                if (currentDownloadRequest) {
                    return this.addToDownloadList(downloadRequests);
                }

                return this.addToDownloadList(downloadRequests)
                    .mergeMap(() => this.switchToNextDownloadRequest());
            });
    }

    // TODO: refactor generateTelemetry param to be removed
    cancel(downloadCancelRequest: DownloadCancelRequest, generateTelemetry: boolean = true): Observable<undefined> {
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
                        .mergeMap(() => this.removeFromDownloadList(downloadCancelRequest, generateTelemetry))
                        .mergeMap(() => this.switchToNextDownloadRequest());
                }

                return this.removeFromDownloadList(downloadCancelRequest, generateTelemetry);
            });
    }

    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void {
        this.downloadCompleteDelegate = downloadCompleteDelegate;
    }

    getAppStorageInfo(): Observable<AppStorageInfo> {
     throw new Error('To be Implemented');
    }

    getActiveDownloadRequest(): Observable<ContentDownloadRequest[]> {
      throw new Error('To be Implemented');
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
                }).do(async () => await this.generateDownloadStartTelemetry(anyDownloadRequest!))
                    .mapTo(undefined)
                    .catch(() => {
                        return this.cancel({
                            identifier: anyDownloadRequest.identifier
                        });
                    });
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

    private removeFromDownloadList(request: DownloadCancelRequest, generateTelemetry: boolean): Observable<undefined> {
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
                ).do(async () => generateTelemetry
                    && toRemoveDownloadRequest && await this.generateDownloadCancelTelemetry(toRemoveDownloadRequest));
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
                        Observable.defer(async () => {
                            await this.generateDownloadCompleteTelemetry(currentDownloadRequest!);
                            await this.downloadCompleteDelegate!.onDownloadCompletion(currentDownloadRequest!).toPromise();
                        }),
                        Observable.defer(() => Observable.of(undefined))
                    ).mergeMap(() => this.cancel({identifier: currentDownloadRequest!.identifier}, false))
                        .catch(() => this.cancel({identifier: currentDownloadRequest!.identifier}, false));
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
                    observer.next({
                        type: DownloadEventType.PROGRESS,
                        payload: {
                            downloadId: downloadRequest.downloadId,
                            identifier: downloadRequest.identifier,
                            progress: -1,
                            status: DownloadStatus.STATUS_FAILED
                        }
                    } as DownloadProgress);
                    observer.complete();
                    return;
                }

                const entry = entries[0];

                observer.next({
                    type: DownloadEventType.PROGRESS,
                    payload: {
                        downloadId: downloadRequest.downloadId,
                        identifier: downloadRequest.identifier,
                        progress: Math.round(entry.totalSizeBytes >= 0 ? (entry.bytesDownloadedSoFar / entry.totalSizeBytes) * 100 : -1),
                        status: entry.status
                    }
                } as DownloadProgress);
                observer.complete();
            });
        });
    }

    private listenForDownloadProgressChanges(): Observable<undefined> {
        return this.currentDownloadRequest$
            .switchMap((currentDownloadRequest: DownloadRequest | undefined) => {
                if (!currentDownloadRequest) {
                    return Observable.of(undefined);
                }

                return Observable.interval(1000)
                    .mergeMap(() => {
                        return this.getDownloadProgress(currentDownloadRequest);
                    })
                    .distinctUntilChanged((prev, next) => {
                        return JSON.stringify(prev) === JSON.stringify(next);
                    })
                    .mergeMap((downloadProgress) => {
                        return Observable.zip(
                            this.handleDownloadCompletion(downloadProgress!),
                            this.emitProgressInEventBus(downloadProgress!)
                        );
                    })
                    .mapTo(undefined);
            });
    }

    private async generateDownloadStartTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_INITIATE,
            env: 'sdk',
            pageId: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }

    private async generateDownloadCompleteTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_SUCCESS,
            env: 'sdk',
            pageId: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }

    private async generateDownloadCancelTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_CANCEL,
            env: 'sdk',
            pageId: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }
}
