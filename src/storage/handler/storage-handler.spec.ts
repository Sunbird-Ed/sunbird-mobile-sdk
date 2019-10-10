import {StorageHandler} from './storage-handler';
import { AppConfig } from '../../api/config/app-config';
import { FileService } from '../../util/file/def/file-service';
import { DbService, DeviceInfo } from '../..';
import { Observable } from 'rxjs';
import { ContentUtil } from '../../content/util/content-util';
import { async } from 'rxjs/internal/scheduler/async';

describe('StorageHandler', () => {
    let storageHandler: StorageHandler;
    const mockAppConfig: Partial<AppConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};

    beforeAll(() => {
        storageHandler = new StorageHandler(
            mockAppConfig as AppConfig,
            mockFileService as FileService,
            mockDbService as DbService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of StorageHandler', () => {
        expect(storageHandler).toBeTruthy();
    });

    it('should extract a content from item', async(done) => {
        // arrange
        const identifier = 'SAMPLE_IDENTIFIER';
        const storageFolder = 'STORAGE_FOLDER_PATH';
        const keepLowerVersion = true;
        mockFileService.readAsText = jest.fn(() => {});
        (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": ["item_1"]}}');
        mockDbService.read = jest.fn(() => {});
        (mockDbService.read as jest.Mock).mockReturnValue(Observable.of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }]));
        spyOn(ContentUtil, 'doesContentExist').and.returnValue(true);
        mockFileService.getDirectorySize = jest.fn(() => {});
        (mockFileService.getDirectorySize as jest.Mock).mockReturnValue(256);
        // act
        await storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
             // assert
            done();
        });
    });

    it('should delete a content from DB', async(done) => {
        // arrange
        const deletedIdentifiers = ['SAMPALE_1', 'SAMPLE_2'];
        mockDbService.execute = jest.fn(() => {});
        (mockDbService.execute as jest.Mock).mockReturnValue(Observable.of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }]));
        mockDbService.beginTransaction = jest.fn(() => {});
        mockDbService.update = jest.fn(() => {});
        (mockDbService.update as jest.Mock).mockReturnValue(Observable.of({}));
        mockDbService.endTransaction = jest.fn(() => {});
        // act
        await storageHandler.deleteContentsFromDb(deletedIdentifiers).then(() => {
             // assert
            done();
        });
    });
});
