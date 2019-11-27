import {StorageDestination, StorageService, TransferContentsRequest} from '..';
import {Observable, of, zip} from 'rxjs';
import {Content} from '../../content';
import {inject, injectable} from 'inversify';
import {EventsBusService} from '../../events-bus';
import {InjectionTokens} from '../../injection-tokens';
import {StorageKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {SharedPreferencesSetCollection} from '../../util/shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import {DbService} from '../../db';
import {DeviceInfo, StorageVolume} from '../../util/device';
import {TransferContentHandler} from '../handler/transfer-content-handler';
import {SdkConfig} from '../../sdk-config';
import {FileService} from '../../util/file/def/file-service';
import {ScanContentContext} from '../def/scan-requests';
import {GetModifiedContentHandler} from '../handler/scan/get-modified-content-handler';
import {PerformActoinOnContentHandler} from '../handler/scan/perform-actoin-on-content-handler';
import {StorageHandler} from '../handler/storage-handler';
import {map, mapTo, mergeMap, tap} from 'rxjs/operators';

@injectable()
export class StorageServiceImpl implements StorageService {
    private static readonly STORAGE_DESTINATION = StorageKeys.KEY_STORAGE_DESTINATION;
    private contentsToTransfer: SharedPreferencesSetCollection<string>;
    private transferContentHandler: TransferContentHandler;
    private lastTransferContentsRequest?: TransferContentsRequest;

    private currentStorageDestination: StorageDestination;
    private availableStorageVolumes: StorageVolume[];

    constructor(@inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
                @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
                @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
                @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        this.contentsToTransfer = new SharedPreferencesSetCollectionImpl(
            this.sharedPreferences,
            StorageKeys.KEY_TO_TRANSFER_LIST,
            (item: string) => item
        );

        this.transferContentHandler = new TransferContentHandler(
            this.sdkConfig,
            this.fileService,
            this.dbService,
            this.eventsBusService,
            this.deviceInfo,
        );
    }

    onInit(): Observable<undefined> {
        return zip(
            this.deviceInfo.getStorageVolumes(),
            this.getStorageDestination()
        ).pipe(
            tap((r) => {
                this.availableStorageVolumes = r[0];
                this.currentStorageDestination = r[1];
                this.scanStorage().toPromise();
            }),
            mapTo(undefined)
        );
    }

    getStorageDestinationDirectoryPath(): string | undefined {
        const storageVolume = this.availableStorageVolumes
            .find((volume) => volume.storageDestination === this.currentStorageDestination);
        return storageVolume && storageVolume.info.contentStoragePath;
    }

    cancelTransfer(): Observable<undefined> {
        return this.transferContentHandler.cancel();
    }

    getStorageDestination(): Observable<StorageDestination> {
        return this.sharedPreferences.getString(StorageServiceImpl.STORAGE_DESTINATION).pipe(
            map(storageDestination =>
                storageDestination ? storageDestination as StorageDestination : StorageDestination.INTERNAL_STORAGE
            )
        );
    }

    getStorageDestinationVolumeInfo(): Observable<StorageVolume> {
        return this.getStorageDestination().pipe(
            map((storageDestination) => {
                return this.availableStorageVolumes
                    .find((volume) => volume.storageDestination === storageDestination)!;
            })
        );
    }

    getToTransferContents(): Observable<Content[]> {
        return of([]);
    }

    getTransferringContent(): Observable<Content | undefined> {
        return of(undefined);
    }

    retryCurrentTransfer(): Observable<undefined> {
        if (this.lastTransferContentsRequest) {
            return this.transferContents({
                ...this.lastTransferContentsRequest,
                shouldMergeInDestination: true
            });
        }

        return of(undefined);
    }

    transferContents(transferContentsRequest: TransferContentsRequest): Observable<undefined> {
        this.lastTransferContentsRequest = transferContentsRequest;
        transferContentsRequest.sourceFolder = this.getStorageDestinationDirectoryPath();
        return this.transferContentHandler.transfer(transferContentsRequest).pipe(
            mergeMap(() => this.getStorageDestination()),
            map((storageDestination: StorageDestination) =>
                storageDestination === StorageDestination.EXTERNAL_STORAGE ? StorageDestination.INTERNAL_STORAGE :
                    StorageDestination.EXTERNAL_STORAGE
            ),
            tap((newStorageDestination) => {
                this.currentStorageDestination = newStorageDestination;
            }),
            mergeMap((newStorageDestination) =>
                this.sharedPreferences.putString(StorageServiceImpl.STORAGE_DESTINATION, newStorageDestination)
            )
        );
    }

    scanStorage(): Observable<boolean> {
        const storageDestinationPath = this.getStorageDestinationDirectoryPath()!;
        const scanContext: ScanContentContext = {currentStoragePath: storageDestinationPath};
        if (!storageDestinationPath) {
            this.resetStorageDestination();
        }
        return new GetModifiedContentHandler(this.fileService, this.dbService).execute(scanContext).pipe(
            mergeMap((scanContentContext: ScanContentContext) => {
                const storageHandler = new StorageHandler(this.sdkConfig.appConfig, this.fileService, this.dbService, this.deviceInfo);
                return new PerformActoinOnContentHandler(storageHandler).exexute(scanContentContext);
            }),
            mapTo(true)
        );

    }

    private async resetStorageDestination() {
        this.currentStorageDestination = StorageDestination.INTERNAL_STORAGE;
        return this.sharedPreferences.putString(StorageServiceImpl.STORAGE_DESTINATION, StorageDestination.INTERNAL_STORAGE).toPromise();
    }
}
