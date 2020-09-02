import {ImportNExportHandler} from './import-n-export-handler';
import {DeviceInfo} from '../../util/device';
import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {of} from 'rxjs';
import {FileService} from '../../util/file/def/file-service';
import {ArrayUtil} from '../../util/array-util';


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

    it('should items children only to mark children with visibility as Parent', (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            path: 'sample_path',
            primary_category: 'textbook'
        }];
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of([]));
        // act
        importNExportHandler.populateItems(request);
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
    });

    it('should moved directory certain and mainfest file creation in native layer', (done) => {
        // arrange
        const request = [{
            'key': 'Sample_key'
        }];
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of([]));
        // act
        importNExportHandler.populateItemList(request);
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
    });

    it('should fetch all children from manifest.json file', async (done) => {
        // arrange
        const request = ['content_id_1', 'content_id_2'];
        mockDbService.execute = jest.fn().mockImplementation(() => {
        });
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            path: 'sample_path'
        }]));
        mockFileService.readAsText = jest.fn().mockImplementation(() => {
        });
        const readAsText = (mockFileService.readAsText as jest.Mock)
            .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });
        ArrayUtil.joinPreservingQuotes = jest.fn().mockImplementation(() => of([]));
        // act
        await importNExportHandler.getContentExportDBModelToExport(request).then((res) => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(res[0].path!).toBe('sample_path');
            expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
            done();
        });
    });

    it('should initialize mainfest', (done) => {
        // arrange
        const request = [1, 2, 3];
        const now = jest.fn().mockImplementation(() => 'April 11, 2019');
        // act
        const data = importNExportHandler.generateManifestForArchive(request);
        // assert
        expect(data.id).toBe('ekstep.content.archive');
        expect(data.ver).toBe('1.1');
        done();
    });
});
