import {Container} from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import {StorageServiceImpl} from './storage-service-impl';
import { EventsBusService, SharedPreferences, DeviceInfo } from '../..';
import { instance, mock } from 'ts-mockito';
import { DbService } from '../../db';
import { FileService } from '../../util/file/def/file-service';
import { SdkConfig } from '../../sdk-config';
import { Observable } from 'rxjs';

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
        container.bind<StorageServiceImpl>(InjectionTokens.STORAGE_SERVICE).to(StorageServiceImpl);
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
    });

    it('should be create a instance of storageServiceImpl', () => {
        expect(storageServiceImpl).toBeTruthy();
    });

    it('should get available storage volume', () => {
        // arrange
        mockDeviceInfo.getStorageVolumes = jest.fn(() => {});
        (mockDeviceInfo.getStorageVolumes as jest.Mock).mockReturnValue(Observable.of([]));
        spyOn(storageServiceImpl, 'getStorageDestination').and.returnValue([]);
        // act
        storageServiceImpl.onInit();
    });
});
