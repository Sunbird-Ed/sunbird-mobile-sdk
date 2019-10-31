import {ImportNExportHandler} from './import-n-export-handler';
import {DeviceInfo} from '../../util/device';
import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {Observable} from 'rxjs';
import { FileService } from '../../util/file/def/file-service';


// jest.mock('moment');

describe('ImportNExportHandler', () => {
    let importNExportHandler: ImportNExportHandler;
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        importNExportHandler = new ImportNExportHandler(
            mockDeviceInfo as DeviceInfo,
            mockDbService as DbService,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of importNExportHandler', () => {
        expect(importNExportHandler).toBeTruthy();
    });

    it('should items children only to mark children with visibility as Parent', () => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            path: 'sample_path'
        }];
        mockDeviceInfo.getDeviceID = jest.fn(() => Observable.of([]));
        // act
        importNExportHandler.populateItems(request);
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
    });

    it('should moved directory certain and mainfest file creation in native layer', () => {
        // arrange
        const request = [{
            'key': 'Sample_key'
        }];
        mockDeviceInfo.getDeviceID = jest.fn(() => Observable.of([]));
        // act
        importNExportHandler.populateItemList(request);
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
    });

    it('should fetch all children from manifest.json file', async (done) => {
        // arrange
        const request = ['content_id_1', 'content_id_2'];
        mockDbService.execute = jest.fn(() => {});
        (mockDbService.execute as jest.Mock).mockReturnValue(Observable.of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            path: 'sample_path'
        }]));
        mockFileService.readAsText = jest.fn(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });
        // act
        await importNExportHandler.getContentExportDBModelToExport(request).then(() => {
            // assert
            // expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should initialize mainfest', () => {
        // arrange
        const request = [1, 2, 3];
        const now = jest.fn(() => 'April 11, 2019');
        // (moment as any as jest.Mock).mockReturnValue(Observable.of(now));
        // act
        importNExportHandler.generateManifestForArchive(request);
        // assert
        // expect(Date.now).toHaveBeenCalled();
    });
});
