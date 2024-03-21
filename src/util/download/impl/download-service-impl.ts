import {
    DownloadCancelRequest,
    DownloadEventType,
    DownloadProgress,
    DownloadRequest,
    DownloadService,
    DownloadStatus,
    TrackDownloadRequest
} from '..';
import {BehaviorSubject, defer, EMPTY, from, iif, interval, Observable, of, zip} from 'rxjs';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {EventNamespace, EventsBusService} from '../../../events-bus';
import {SharedPreferences} from '../../shared-preferences';
import Set from 'typescript-collections/dist/lib/Set';
import * as downloadManagerInstance from 'cordova-plugin-android-downloadmanager';
import {DownloadCompleteDelegate} from '../def/download-complete-delegate';
import {DownloadKeys} from '../../../preference-keys';
import {TelemetryLogger} from '../../../telemetry/util/telemetry-logger';
import {InteractSubType, InteractType} from '../../../telemetry';
import {SharedPreferencesSetCollection} from '../../shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../shared-preferences/impl/shared-preferences-set-collection-impl';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {catchError, concatMapTo, distinctUntilChanged, mapTo, mergeMap, switchMap, take, tap, map} from 'rxjs/operators';
import {ContentDeleteListener} from '../../../content/def/content-delete-listener';
import {DownloadTracking} from '../def/response';
import { ContentUtil } from '../../../content/util/content-util';

@injectable()
export class DownloadServiceImpl implements DownloadService, SdkServiceOnInitDelegate, ContentDeleteListener {
    private static readonly KEY_TO_DOWNLOAD_LIST = DownloadKeys.KEY_TO_DOWNLOAD_LIST;
    private static readonly DOWNLOAD_DIR_NAME = 'Download';

    private currentDownloadRequest$ = new BehaviorSubject<DownloadRequest | undefined>(undefined);
    private downloadCompleteDelegate?: DownloadCompleteDelegate;
    private sharedPreferencesSetCollection: SharedPreferencesSetCollection<DownloadRequest>;

    private completedDownloadRequestsCache: Set<DownloadRequest> = new Set<DownloadRequest>((r) => r.identifier);

    constructor(@inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences) {
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
            objType: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['primaryCategory'] ?
                ContentUtil.readPrimaryCategoryServer(downloadRequest['contentMeta']) : 'Content',
            objVer: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['pkgVersion'] ?
                downloadRequest['contentMeta']['pkgVersion'] : '',
            correlationData: downloadRequest['correlationData'] || []
        }).pipe(
            mapTo(undefined)
        ).toPromise();
    }

    private static async generateDownloadCompleteTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_SUCCESS,
            env: 'sdk',
            pageId: 'ContentDetail',
            id: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['primaryCategory'] ?
            ContentUtil.readPrimaryCategoryServer(downloadRequest['contentMeta']) : 'Content',
            objVer: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['pkgVersion'] ?
                downloadRequest['contentMeta']['pkgVersion'] : '',
            correlationData: downloadRequest['correlationData'] || []
        }).pipe(
            mapTo(undefined)
        ).toPromise();
    }

    private static async generateDownloadCancelTelemetry(downloadRequest: DownloadRequest): Promise<void> {
        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.CONTENT_DOWNLOAD_CANCEL,
            env: 'sdk',
            pageId: 'ContentDetail',
            id: 'ContentDetail',
            objId: downloadRequest.identifier,
            objType: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['primaryCategory'] ?
            ContentUtil.readPrimaryCategoryServer(downloadRequest['contentMeta']) : 'Content',
            objVer: downloadRequest['contentMeta'] && downloadRequest['contentMeta']['pkgVersion'] ?
                downloadRequest['contentMeta']['pkgVersion'] : '',
            correlationData: downloadRequest['correlationData'] || []
        }).pipe(
            mapTo(undefined)
        ).toPromise();
    }

    onInit(): Observable<undefined> {
            return this.switchToNextDownloadRequest()
                .pipe(
                    mergeMap(() => {
                            return this.listenForDownloadProgressChanges();
                    })
                );
    }

    download(downloadRequests: DownloadRequest[]): Observable<undefined> {
        return this.currentDownloadRequest$
            .pipe(
                take(1),
                mergeMap((currentDownloadRequest?: DownloadRequest) => {
                    if (currentDownloadRequest) {
                        return this.addToDownloadList(downloadRequests);
                    }

                    return this.addToDownloadList(downloadRequests)
                        .pipe(
                            tap(async () => await this.switchToNextDownloadRequest().toPromise())
                        );
                })
            );
    }

    cancel(downloadCancelRequest: DownloadCancelRequest, generateTelemetry: boolean = true): Observable<undefined> {
        return this.currentDownloadRequest$
            .pipe(
                take(1),
                mergeMap((currentDownloadRequest?: DownloadRequest) => {
                    if (currentDownloadRequest && currentDownloadRequest.identifier === downloadCancelRequest.identifier) {
                        return new Observable((observer) => {
                            downloadManager.remove([currentDownloadRequest.downloadId!], (err, removeCount) => {
                                if (err) {
                                    observer.error(err);
                                }

                                observer.next(!!removeCount);
                                observer.complete();
                            });
                        }).pipe(
                            mergeMap(() => this.removeFromDownloadList(downloadCancelRequest, generateTelemetry)),
                            tap(async () => await this.switchToNextDownloadRequest().toPromise())
                        );
                    }

                    return this.removeFromDownloadList(downloadCancelRequest, generateTelemetry);
                })
            );
    }

    cancelAll(): Observable<void> {
        return this.currentDownloadRequest$
            .pipe(
                take(1),
                mergeMap((currentDownloadRequest?: DownloadRequest) => {
                    if (currentDownloadRequest) {
                        return new Observable((observer) => {
                            downloadManager.remove([currentDownloadRequest.downloadId!], (err, removeCount) => {
                                if (err) {
                                    observer.error(err);
                                }

                                observer.next(!!removeCount);
                                observer.complete();
                            });
                        }).pipe(
                            mergeMap(() => this.removeAllFromDownloadList()),
                            mergeMap(() => this.switchToNextDownloadRequest())
                        );
                    }

                    return this.removeAllFromDownloadList();
                })
            );
    }

    registerOnDownloadCompleteDelegate(downloadCompleteDelegate: DownloadCompleteDelegate): void {
        this.downloadCompleteDelegate = downloadCompleteDelegate;
    }

    getActiveDownloadRequests(): Observable<DownloadRequest[]> {
        return this.sharedPreferencesSetCollection.asListChanges().pipe(
            map((list) => {
                return list.sort((first, second) => {
                    const firstPriority = first.withPriority || 0;
                    const secondPriority = second.withPriority || 0;
                    return secondPriority - firstPriority;
                });
            })
        );
    }

    private switchToNextDownloadRequest(): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asSet()
            .pipe(
                mergeMap((downloadListAsSet: Set<DownloadRequest>) => {
                    if (!downloadListAsSet.size()) {
                        return of(undefined).pipe(
                            tap(() => this.currentDownloadRequest$.next(undefined))
                        );
                    }

                    const anyDownloadRequest = downloadListAsSet.toArray()
                        .sort((first, second) => {
                            const firstPriority = first.withPriority || 0;
                            const secondPriority = second.withPriority || 0;

                            return secondPriority - firstPriority;
                        })
                        .shift() as DownloadRequest;

                    return new Observable<string>((observer) => {
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
                    }).pipe(
                        tap(async (downloadId) => {
                            let devicePlatform = "";
                            await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
                                devicePlatform = val.platform
                            })
                            let dataDirectory = devicePlatform.toLowerCase() === "ios" ? cordova.file.documentsDirectory : cordova.file.externalDataDirectory;
                            anyDownloadRequest.downloadedFilePath = dataDirectory +
                            DownloadServiceImpl.DOWNLOAD_DIR_NAME + '/' + anyDownloadRequest.filename;
                            anyDownloadRequest.downloadId = downloadId;
                            this.currentDownloadRequest$.next(anyDownloadRequest);                           
                        }),
                        tap(async () => await DownloadServiceImpl.generateDownloadStartTelemetry(anyDownloadRequest!)),
                        mapTo(undefined),
                        catchError(() => {
                            return this.cancel({
                                identifier: anyDownloadRequest.identifier
                            });
                        })
                    );
                })
            );
    }

    private addToDownloadList(requests: DownloadRequest[]): Observable<undefined> {
        return this.sharedPreferencesSetCollection.addAll(requests).pipe(
            mapTo(undefined)
        );
    }

    private removeFromDownloadList(request: DownloadCancelRequest, generateTelemetry: boolean): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asList()
            .pipe(
                mergeMap((downloadRequests: DownloadRequest[]) => {
                    const toRemoveDownloadRequest = downloadRequests
                        .find((downloadRequest) => downloadRequest.identifier === request.identifier);


                    if (!toRemoveDownloadRequest) {
                        return of(undefined);
                    }

                    return this.sharedPreferencesSetCollection.remove(toRemoveDownloadRequest)
                        .pipe(
                            mapTo(undefined),
                            tap(async () => generateTelemetry
                                && await DownloadServiceImpl.generateDownloadCancelTelemetry(toRemoveDownloadRequest))
                        );
                })
            );
    }

    private removeAllFromDownloadList(): Observable<undefined> {
        return this.sharedPreferencesSetCollection.asList()
            .pipe(
                take(1),
                mergeMap((downloadRequests: DownloadRequest[]) => {
                    return this.sharedPreferencesSetCollection.clear()
                        .pipe(
                            mergeMap(() => {
                                return from(downloadRequests)
                                    .pipe(
                                        tap(async (downloadRequest) =>
                                            await DownloadServiceImpl.generateDownloadCancelTelemetry(downloadRequest)),
                                        concatMapTo(of(undefined))
                                    );
                            })
                        );
                })
            );
    }

    private handleDownloadCompletion(downloadProgress: DownloadProgress): Observable<undefined> {
        return this.currentDownloadRequest$
            .pipe(
                take(1),
                mergeMap((currentDownloadRequest) => {
                    if (downloadProgress.payload.status === DownloadStatus.STATUS_SUCCESSFUL) {
                        this.completedDownloadRequestsCache.add(currentDownloadRequest!);

                        return iif(
                            () => !!this.downloadCompleteDelegate,
                            defer(async () => {
                                await DownloadServiceImpl.generateDownloadCompleteTelemetry(currentDownloadRequest!);
                                await this.downloadCompleteDelegate!.onDownloadCompletion(currentDownloadRequest!).toPromise();
                            }),
                            defer(() => of(undefined))
                        ).pipe(
                            mapTo(undefined)
                        );
                    }

                    return of(undefined);
                })
            );
    }

    private emitProgressInEventBus(downloadProgress: DownloadProgress): Observable<undefined> {
        return defer(() => {
            return of(this.eventsBusService.emit({
                namespace: EventNamespace.DOWNLOADS,
                event: downloadProgress
            })).pipe(
                mapTo(undefined)
            );
        });
    }

    private getDownloadProgress(downloadRequest: DownloadRequest): Observable<DownloadProgress> {
        return new Observable((observer) => {
            downloadManager.query({ids: [downloadRequest.downloadId!]}, async (err, entries) => {
                if (err) {
                    observer.next({
                        type: DownloadEventType.PROGRESS,
                        payload: {
                            downloadId: downloadRequest.downloadId,
                            identifier: downloadRequest.identifier,
                            progress: -1,
                            bytesDownloaded: 0,
                            totalSizeInBytes: 0,
                            status: DownloadStatus.STATUS_FAILED
                        }
                    } as DownloadProgress);
                    observer.complete();

                    await this.cancel({identifier: downloadRequest.identifier}).toPromise();

                    return;
                }

                const entry = entries[0];

                observer.next({
                    type: DownloadEventType.PROGRESS,
                    payload: {
                        downloadId: downloadRequest.downloadId,
                        identifier: downloadRequest.identifier,
                        progress: Math.round(entry.totalSizeBytes >= 0 ? (entry.bytesDownloadedSoFar / entry.totalSizeBytes) * 100 : -1),
                        bytesDownloaded: entry.bytesDownloadedSoFar,
                        totalSizeInBytes: entry.totalSizeBytes,
                        status: entry.status
                    }
                } as DownloadProgress);
                observer.complete();
            });
        });
    }

    private listenForDownloadProgressChanges(): Observable<undefined> {
        return this.currentDownloadRequest$
            .pipe(
                switchMap((currentDownloadRequest: DownloadRequest | undefined) => {
                    if (!currentDownloadRequest) {
                        return of(undefined);
                    }

                    this.eventsBusService.emit({
                        namespace: EventNamespace.DOWNLOADS,
                        event: {
                            type: DownloadEventType.START,
                            payload: undefined
                        }
                    });

                    return interval(1000)
                        .pipe(
                            mergeMap(() => {
                                return this.getDownloadProgress(currentDownloadRequest);
                            }),
                            distinctUntilChanged((prev, next) => {
                                return JSON.stringify(prev) === JSON.stringify(next);
                            }),
                            mergeMap((downloadProgress) => {
                                return zip(
                                    this.handleDownloadCompletion(downloadProgress!),
                                    this.emitProgressInEventBus(downloadProgress!)
                                ).pipe(
                                    mapTo(downloadProgress)
                                );
                            }),
                            tap((downloadProgress) => {
                                if (
                                    downloadProgress.payload.status === DownloadStatus.STATUS_FAILED ||
                                    downloadProgress.payload.status === DownloadStatus.STATUS_SUCCESSFUL
                                ) {
                                    this.eventsBusService.emit({
                                        namespace: EventNamespace.DOWNLOADS,
                                        event: {
                                            type: DownloadEventType.END,
                                            payload: undefined
                                        }
                                    });
                                }
                            }),
                            mapTo(undefined)
                        );
                })
            );
    }

    trackDownloads(downloadStatRequest: TrackDownloadRequest): Observable<DownloadTracking> {
        if (!downloadStatRequest.groupBy.fieldPath || !downloadStatRequest.groupBy.value) {
            return EMPTY;
        }

        return this.getActiveDownloadRequests().pipe(
            map((queued) => {
                const hasMatchingFieldValue = (request) => {
                    return downloadStatRequest.groupBy.value === downloadStatRequest.groupBy.fieldPath.split('.').reduce((o, i) => {
                        if (o && o[i]) {
                            return o[i];
                        }

                        return undefined;
                    }, request);
                };

                return {
                    completed:
                        this.completedDownloadRequestsCache.size() ? this.completedDownloadRequestsCache.toArray().filter(hasMatchingFieldValue) : [],
                    queued:
                        queued.length ? queued.filter(hasMatchingFieldValue) : []
                };
            })
        );
    }

    onContentDelete(identifier: string) {
        this.completedDownloadRequestsCache.remove({ identifier } as DownloadRequest);
    }
}
