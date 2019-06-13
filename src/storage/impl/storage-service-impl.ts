import {
    StorageDestination,
    StorageEventType,
    StorageService,
    StorageTransferCompleted,
    StorageTransferFailed,
    StorageTransferFailedDuplicateContent,
    StorageTransferRevertCompleted,
    TransferContentsRequest,
    TransferFailedDuplicateContentError,
    TransferFailedError
} from '..';
import {BehaviorSubject, Observable} from 'rxjs';
import {Content} from '../../content';
import {inject, injectable} from 'inversify';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {InjectionTokens} from '../../injection-tokens';
import {StorageKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {SharedPreferencesSetCollection} from '../../util/shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import {DbService} from '../../db';
import {ContentEntry} from '../../content/db/schema';
import {ContentMapper} from '../../content/util/content-mapper';
import {TransferContentHandler} from '../handler/transfer-content-handler';
import {DeviceInfo, StorageVolume} from '../../util/device';

@injectable()
export class StorageServiceImpl implements StorageService {
    private static readonly STORAGE_DESTINATION = StorageKeys.KEY_STORAGE_DESTINATION;
    private transferringContent$ = new BehaviorSubject<Content | undefined>(undefined);
    private contentsToTransfer: SharedPreferencesSetCollection<Content>;

    constructor(@inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
                @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo) {
        this.contentsToTransfer = new SharedPreferencesSetCollectionImpl(
            this.sharedPreferences,
            StorageKeys.KEY_TO_TRANSFER_LIST,
            (item: Content) => item.identifier
        );
    }

    onInit(): Observable<undefined> {
        return this.cancelTransfer();
    }

    getStorageDestinationVolumeInfo(): Observable<StorageVolume> {
        return Observable.zip(
            this.getStorageDestination(),
            this.deviceInfo.getStorageVolumes()
        ).map((results) => {
            const storageDestination = results[0];
            const storageVolumes = results[1];
            return storageVolumes
                .find((volume) => volume.storageDestination === storageDestination)!;
        });
    }

    getStorageDestination(): Observable<StorageDestination> {
        return this.sharedPreferences
            .getString(StorageServiceImpl.STORAGE_DESTINATION)
            .map(storageDestination =>
                storageDestination ? storageDestination as StorageDestination : StorageDestination.INTERNAL_STORAGE
            );
    }

    getToTransferContents(): Observable<Content[]> {
        return this.contentsToTransfer.asListChanges();
    }

    getTransferringContent(): Observable<Content | undefined> {
        return this.transferringContent$.asObservable().take(1);
    }

    cancelTransfer(): Observable<undefined> {
        return this.pauseTransferContentIfAny()
            .mergeMap(() => this.deleteTempDirectoriesIfAny())
            .mergeMap(() => this.clearTransferQueue());
    }

    retryCurrentTransfer(): Observable<undefined> {
        return this.switchToNextContent();
    }

    transferContents(transferContentsRequest: TransferContentsRequest): Observable<undefined> {
        return this.getContentsToTransfer(transferContentsRequest)
            .mergeMap((contents) => this.addContentsToTransferQueue(contents))
            .mergeMap(() => this.switchToNextContent())
            .mergeMap(() => this.transferringContent$)
            .switchMap((content?) => content ?
                this.transferSingleContent(transferContentsRequest.storageDestination)
                    .catch((e) => {
                        this.emitErrorEvent(e);
                        return this.pauseTransferContentIfAny();
                    }) :
                Observable.empty<undefined>())
            .takeUntil(this.contentsToTransferEmptied())
            .mergeMap(() => this.switchToNextContent())
            .reduce(() => undefined)
            .mergeMap(() => this.endTransfer());
    }

    private contentsToTransferEmptied(): Observable<undefined> {
        return this.contentsToTransfer.asListChanges().skip(1)
            .switchMap((contents) =>
                !contents.length ? Observable.of(undefined) : Observable.empty<undefined>()
            );
    }

    private transferSingleContent(storageDestination: StorageDestination): Observable<undefined> {
        return this.getTransferringContent()
            .mergeMap((content?) => {
                return content ? new TransferContentHandler().handle(
                    storageDestination,
                    content,
                    this.eventsBusService
                ) : Observable.of(undefined);
            });
    }

    private deleteTempDirectoriesIfAny(): Observable<undefined> {
        // TODO: Swayangjit
        return Observable.of(undefined);
    }

    private revertTransferIfAny(): Observable<undefined> {
        // TODO: Swayangjit
        return Observable.of(undefined)
            .do(() => this.eventsBusService.emit({
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_REVERT_COMPLETED,
                } as StorageTransferRevertCompleted
            }));
    }

    private getContentsToTransfer(transferContentsRequest: TransferContentsRequest): Observable<Content[]> {
        if (!!transferContentsRequest.contents.length) {
            return Observable.of(transferContentsRequest.contents);
        }

        return this.dbService
            .read({table: ContentEntry.TABLE_NAME})
            .map((contentEntries) => contentEntries.map(ContentMapper.mapContentDBEntryToContent));
    }

    private addContentsToTransferQueue(contents: Content[]): Observable<undefined> {
        return this.contentsToTransfer.addAll(contents).mapTo(undefined);
    }

    private switchToNextContent(): Observable<undefined> {
        return this.getTransferringContent()
            .mergeMap((content?: Content) =>
                content ? this.contentsToTransfer.remove(content).mapTo(undefined) : Observable.of(undefined)
            )
            .mergeMap(() => this.contentsToTransfer.asList())
            .do((contents) => {
                if (contents.length) {
                    return this.transferringContent$!.next(contents[0]);
                }
            }).mapTo(undefined);
    }

    private pauseTransferContentIfAny(): Observable<undefined> {
        return Observable.defer(() => this.transferringContent$.next(undefined));
    }

    private clearTransferQueue(): Observable<undefined> {
        return this.contentsToTransfer.clear().mapTo(undefined);
    }

    private endTransfer(): Observable<undefined> {
        return this.getStorageDestination()
            .mergeMap((storageDestination) => {
                const newStorageDestination = storageDestination === StorageDestination.INTERNAL_STORAGE ?
                    StorageDestination.EXTERNAL_STORAGE : StorageDestination.INTERNAL_STORAGE;
                return this.sharedPreferences.putString(StorageServiceImpl.STORAGE_DESTINATION, newStorageDestination);
            })
            .do(() => {
                this.eventsBusService.emit({
                    namespace: EventNamespace.STORAGE,
                    event: {
                        type: StorageEventType.TRANSFER_COMPLETED,
                    } as StorageTransferCompleted
                });
            });
    }

    private emitErrorEvent(e: any) {
        console.error(e);

        if (e instanceof TransferFailedDuplicateContentError) {
            this.eventsBusService.emit({
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_FAILED_DUPLICATE_CONTENT,
                } as StorageTransferFailedDuplicateContent
            });
        } else if (e instanceof TransferFailedError) {
            this.eventsBusService.emit({
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_FAILED,
                    payload: {
                        directory: e.directory,
                        error: e.message
                    },
                } as StorageTransferFailed
            });
        } else {
            this.eventsBusService.emit({
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_FAILED,
                    payload: {
                        directory: 'UNKNOWN',
                        error: e
                    },
                } as StorageTransferFailed
            });
        }
    }
}
