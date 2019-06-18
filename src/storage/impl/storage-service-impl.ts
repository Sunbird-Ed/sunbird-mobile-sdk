import {StorageDestination, StorageService, TransferContentsRequest} from '..';
import {Observable} from 'rxjs';
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

@injectable()
export class StorageServiceImpl implements StorageService {
    private static readonly STORAGE_DESTINATION = StorageKeys.KEY_STORAGE_DESTINATION;
    private contentsToTransfer: SharedPreferencesSetCollection<string>;
    private transferContentHandler: TransferContentHandler;
    private lastTransferContentsRequest?: TransferContentsRequest;

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

    cancelTransfer(): Observable<undefined> {
        return this.transferContentHandler.cancel();
    }

    getStorageDestination(): Observable<StorageDestination> {
        return this.sharedPreferences
            .getString(StorageServiceImpl.STORAGE_DESTINATION)
            .map(storageDestination =>
                storageDestination ? storageDestination as StorageDestination : StorageDestination.INTERNAL_STORAGE
            );
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

    getToTransferContents(): Observable<Content[]> {
        return Observable.of([]);
    }

    getTransferringContent(): Observable<Content | undefined> {
        return Observable.of(undefined);
    }

    onInit(): Observable<undefined> {
        return Observable.of(undefined);
    }

    retryCurrentTransfer(): Observable<undefined> {
        if (this.lastTransferContentsRequest) {
            return this.transferContents({
                ...this.lastTransferContentsRequest,
                shouldMergeInDestination: true
            });
        }

        return Observable.of(undefined);
    }

    transferContents(transferContentsRequest: TransferContentsRequest): Observable<undefined> {
        this.lastTransferContentsRequest = transferContentsRequest;

        return this.transferContentHandler
            .transfer(transferContentsRequest)
            .mergeMap(() => this.getStorageDestination())
            .map((storageDestination: StorageDestination) =>
                storageDestination === StorageDestination.EXTERNAL_STORAGE ? StorageDestination.INTERNAL_STORAGE :
                    StorageDestination.EXTERNAL_STORAGE
            )
            .mergeMap((newStorageDestination) =>
                this.sharedPreferences.putString(StorageServiceImpl.STORAGE_DESTINATION, newStorageDestination)
            );
    }
}
