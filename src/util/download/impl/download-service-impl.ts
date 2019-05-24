import {DownloadService} from '../def/download-service';
import {BehaviorSubject, Observable} from 'rxjs';
import {DownloadEventType, DownloadProgress} from '../def/download-event';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {DownloadCancelRequest, DownloadRequest} from '../def/requests';
import {DownloadStatus} from '../def/download-status';
import {EventNamespace, EventsBusService} from '../../../events-bus';
import {SharedPreferences} from '../../shared-preferences';
import * as Collections from 'typescript-collections';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';
import {DownloadCompleteDelegate} from '../def/download-complete-delegate';
import {DownloadKeys} from '../../../preference-keys';
import {TelemetryLogger} from '../../../telemetry/util/telemetry-logger';
import {InteractSubType, InteractType, ObjectType} from '../../../telemetry';
import {SharedPreferencesSetCollection} from '../../shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../shared-preferences/impl/shared-preferences-set-collection-impl';

export class DownloadServiceImpl implements DownloadService, SdkServiceOnInitDelegate {
    private static readonly KEY_TO_DOWNLOAD_LIST = DownloadKeys.KEY_TO_DOWNLOAD_LIST;
    private static readonly DOWNLOAD_DIR_NAME = 'Download';

    private currentDownloadRequest$ = new BehaviorSubject<DownloadRequest | undefined>(undefined);
    private downloadCompleteDelegate?: DownloadCompleteDelegate;
    private sharedPreferencesSetCollection: SharedPreferencesSetCollection<DownloadRequest>;

    constructor(private eventsBusService: EventsBusService,
                private sharedPreferences: SharedPreferences) {
        window['downloadManager'] = downloadManagerInstance;

        this.sharedPreferencesSetCollection = new SharedPreferencesSetCollectionImpl(
            this.sharedPreferences,
            DownloadServiceImpl.KEY_TO_DOWNLOAD_LIST,
            (item) => item.identifier
        );
    }

    private static async generateDownloadStartTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_INITIATE,
            env: 'sdk',
            pageId: 'ContentDetail',
            id: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }

    private static async generateDownloadCompleteTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_SUCCESS,
            env: 'sdk',
            pageId: 'ContentDetail',
            id: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }

    private static async generateDownloadCancelTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_CANCEL,
            env: 'sdk',
            pageId: 'ContentDetail',
            id: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: ObjectType.CONTENT,
            correlationData: downloadRequest['correlationData'] || []
        }).mapTo(undefined).toPromise();
    }

    onInit(): Observable<undefined> {
        return this.switchToNextDownloadRequest()
            .mergeMap(() => {
                return this.listenForDownloadProgressChanges();
            });
    }

    download(downloadRequests: DownloadRequest[]): Observable<undefined> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest?: DownloadRequest) => {
                if (currentDownloadRequest) {
                    return this.addToDownloadList(downloadRequests);
                }

                return this.addToDownloadList(downloadRequests)
                    .do(() => this.switchToNextDownloadRequest().toPromise());
            });
    }

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
                        .do(() => this.switchToNextDownloadRequest().toPromise());
                }

                return this.removeFromDownloadList(downloadCancelRequest, generateTelemetry);
            });
    }

    cancelAll(): Observable<void> {
        return this.currentDownloadRequest$
            .take(1)
            .mergeMap((currentDownloadRequest?: DownloadRequest) => {
                if (currentDownloadRequest) {
                    return Observable.create((observer) => {
                        downloadManager.remove([currentDownloadRequest.downloadId!], (err, removeCount) => {
                            if (err) {
                                observer.error(err);
                            }

                            observer.next(!!removeCount);
                            observer.complete();
                        });
                    })
                        .mergeMap(() => this.removeAllFromDownloadList())
                        .mergeMap(() => this.switchToNextDownloadRequest());
                }

                return this.removeAllFromDownloadList();
            });
    }

    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void {
        this.downloadCompleteDelegate = downloadCompleteDelegate;
    }

    getActiveDownloadRequests(): Observable<DownloadRequest[]> {
        return this.sharedPreferencesSetCollection.asListChanges();
    }

    private switchToNextDownloadRequest(): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asSet()
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
                }).do(async () => await DownloadServiceImpl.generateDownloadStartTelemetry(anyDownloadRequest!))
                    .mapTo(undefined)
                    .catch(() => {
                        return this.cancel({
                            identifier: anyDownloadRequest.identifier
                        });
                    });
            });
    }

    private addToDownloadList(requests: DownloadRequest[]): Observable<undefined> {
        return this.sharedPreferencesSetCollection.addAll(requests).mapTo(undefined);
    }

    private removeFromDownloadList(request: DownloadCancelRequest, generateTelemetry: boolean): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asList()
            .mergeMap((downloadRequests: DownloadRequest[]) => {
                const toRemoveDownloadRequest = downloadRequests
                    .find((downloadRequest) => downloadRequest.identifier === request.identifier);


                if (!toRemoveDownloadRequest) {
                    return Observable.of(undefined);
                }

                return this.sharedPreferencesSetCollection.remove(toRemoveDownloadRequest).mapTo(undefined)
                    .do(async () => generateTelemetry
                        && await DownloadServiceImpl.generateDownloadCancelTelemetry(toRemoveDownloadRequest));
            });
    }

    private removeAllFromDownloadList(): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asList()
            .take(1)
            .mergeMap((downloadRequests: DownloadRequest[]) => {

                return this.sharedPreferencesSetCollection.clear()
                    .mergeMap(() => {
                        return Observable.from(downloadRequests)
                            .do(async (downloadRequest) => await DownloadServiceImpl.generateDownloadCancelTelemetry(downloadRequest))
                            .concatMapTo(Observable.of(undefined));
                    });
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
                            await DownloadServiceImpl.generateDownloadCompleteTelemetry(currentDownloadRequest!);
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

                    this.cancel({identifier: downloadRequest.identifier}).toPromise();

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
}
