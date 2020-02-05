import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { StorageServiceImpl } from './storage-service-impl';
import { EventsBusService, SharedPreferences, DeviceInfo, StorageDestination, TransferContentsRequest, ExistingContentAction } from '../..';
import { instance, mock } from 'ts-mockito';
import { DbService } from '../../db';
import { FileService } from '../../util/file/def/file-service';
import { SdkConfig } from '../../sdk-config';
import { of } from 'rxjs';
import { StorageKeys } from '../../preference-keys';
import { StorageHandler } from '../handler/storage-handler';
import { GetModifiedContentHandler } from '../handler/scan/get-modified-content-handler';
import { PerformActoinOnContentHandler } from '../handler/scan/perform-actoin-on-content-handler';
import { TransferContentHandler } from '../handler/transfer-content-handler';
import { StorageService } from '..';

jest.mock('../handler/storage-handler');
jest.mock('../handler/scan/get-modified-content-handler');
jest.mock('../handler/scan/perform-actoin-on-content-handler');
jest.mock('../handler/transfer-content-handler');

describe('StorageServiceImpl', () => {
    let storageServiceImpl: StorageServiceImpl;
    const container = new Container();
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFileService: Partial<FileService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockSharedPreferences: SharedPreferences = instance(mock<SharedPreferences>());

    beforeAll(() => {
        container.bind<StorageService>(InjectionTokens.STORAGE_SERVICE).to(StorageServiceImpl).inTransientScope();
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).toConstantValue(mockEventsBusService as EventsBusService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);

        storageServiceImpl = container.get(InjectionTokens.STORAGE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (StorageHandler as any as jest.Mock<StorageHandler>).mockClear();
        (GetModifiedContentHandler as any as jest.Mock<GetModifiedContentHandler>).mockClear();
        (PerformActoinOnContentHandler as any as jest.Mock<PerformActoinOnContentHandler>).mockClear();
        (TransferContentHandler as any as jest.Mock<TransferContentHandler>).mockClear();
    });

    it('should be create a instance of storageServiceImpl', () => {
        expect(storageServiceImpl).toBeTruthy();
    });

    it('should get available storage volume', (done) => {
        // arrange
        mockDeviceInfo.getStorageVolumes = jest.fn().mockImplementation(() => ({ name: 's-name' }));
        (mockDeviceInfo.getStorageVolumes as jest.Mock).mockReturnValue(of([]));
        jest.spyOn(storageServiceImpl, 'getStorageDestination').mockReturnValue(of(StorageDestination.EXTERNAL_STORAGE));
        mockDbService.execute = jest.fn().mockImplementation(() => of({ name: 's-name' }));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of('undefined'));
        (GetModifiedContentHandler as any as jest.Mock<GetModifiedContentHandler>).mockImplementation(() => {
            return {
                execute: jest.fn().mockImplementation(() => of({ name: 's-name' })),
            } as Partial<GetModifiedContentHandler> as GetModifiedContentHandler;
        });
        (PerformActoinOnContentHandler as any as jest.Mock<PerformActoinOnContentHandler>).mockImplementation(() => {
            return {
                exexute: jest.fn().mockImplementation(() => of({ currentStoragePath: 's-name' })),
            } as Partial<PerformActoinOnContentHandler> as PerformActoinOnContentHandler;
        });
        // act
        storageServiceImpl.onInit().subscribe(() => {
            setTimeout(() => {
                expect(mockDeviceInfo.getStorageVolumes).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(
                    StorageKeys.KEY_STORAGE_DESTINATION,
                    StorageDestination.INTERNAL_STORAGE);
                done();
            }, 0);
        });
    });

    it('should handle content trasfer', (done) => {
        // arrange
        (TransferContentHandler as any as jest.Mock<TransferContentHandler>).mockImplementation(() => {
            return {
                cancel: jest.fn().mockImplementation(() => of(undefined)),
            } as Partial<TransferContentHandler> as TransferContentHandler;
        });
        // act
        storageServiceImpl.cancelTransfer();
        // assert
        expect(TransferContentHandler.prototype.cancel).toHaveBeenCalled();
        done();
    });

    it('should return storage location', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('storage-size'));
        // act
        storageServiceImpl.getStorageDestination().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(StorageKeys.KEY_STORAGE_DESTINATION);
            done();
        });
    });

    it('should return storage volume information', (done) => {
        // arrange
        // act
        storageServiceImpl.getStorageDestinationVolumeInfo().subscribe(() => {
            // assert
            done();
        });
    });

    it('should getToTransferContents', (done) => {
        storageServiceImpl.getToTransferContents().subscribe(() => {
            done();
        });
    });

    it('should getToTransferContents', (done) => {
        storageServiceImpl.getTransferringContent().subscribe(() => {
            done();
        });
    });

    it('should retryCurrentTransfer', (done) => {
        storageServiceImpl.retryCurrentTransfer().subscribe(() => {
            done();
        });
    });

    it('should retryCurrentTransfer', (done) => {
        storageServiceImpl.retryCurrentTransfer().subscribe(() => {
            done();
        });
    });

    it('should transfer Contents ', (done) => {
        // arrange
        (TransferContentHandler as any as jest.Mock<TransferContentHandler>).mockImplementation(() => {
            return {
                transfer: jest.fn().mockImplementation(() => of(undefined)),
            } as Partial<TransferContentHandler> as TransferContentHandler;
        });

        const storageService = container.get<StorageService>(InjectionTokens.STORAGE_SERVICE);

        const request: TransferContentsRequest = {
            contentIds: ['sid'],
            existingContentAction: ExistingContentAction.KEEP_DESTINATION,
            destinationFolder: 'd-folder',
            deleteDestination: true
        };
        jest.spyOn(storageService, 'getStorageDestinationDirectoryPath').mockReturnValue('getStorageDestinationDirectoryPath');
        jest.spyOn(storageService, 'getStorageDestination').mockReturnValue(of(StorageDestination.EXTERNAL_STORAGE));

        // act
        storageService.transferContents(request).subscribe((e) => {
             expect(storageService.getStorageDestination).toHaveBeenCalled();
             expect(storageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
             done();
         });
    });
});
