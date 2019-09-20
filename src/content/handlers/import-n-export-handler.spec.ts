import {ImportNExportHandler} from './import-n-export-handler';
import {DeviceInfo} from '../../util/device';
import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {Observable} from 'rxjs';


// jest.mock('moment');

describe('ImportNExportHandler', () => {
    let importNExportHandler: ImportNExportHandler;
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        importNExportHandler = new ImportNExportHandler(
            mockDeviceInfo as DeviceInfo,
            mockDbService as DbService
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
            content_type: 'CONTENT_TYPE'
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

    it('should export Ecar feature', async (done) => {
        // arrange
        const request = [];
        mockDbService.execute = jest.fn(() => Observable.of([]));
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
