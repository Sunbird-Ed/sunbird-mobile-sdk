import {WriteManifest} from './write-manifest';
import {FileService} from '../../../util/file/def/file-service';
import {ContentEntry} from '../../db/schema';
import {ExportContentContext} from '../..';
import {DeviceInfo} from '../../..';
import {of} from 'rxjs';

describe('writeManifest', () => {
    let writeManifest: WriteManifest;
    const mockFileService: Partial<FileService> = {
        writeFile: jest.fn().mockImplementation(() => {
        })
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {
        getAvailableInternalMemorySize: jest.fn().mockImplementation(() => {
        })
    };

    beforeAll(() => {
        writeManifest = new WriteManifest(
            mockFileService as FileService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of ecarBundle', () => {
        expect(writeManifest).toBeTruthy();
    });

    it('should be able to write a file if internal memory availabe', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            ecarFilePath: 'ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: [{'size': 'sample'}],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        const async1 = (mockDeviceInfo.getAvailableInternalMemorySize as jest.Mock).mockReturnValue(of('1024'));
        const async2 = (mockDeviceInfo.getAvailableInternalMemorySize as jest.Mock).mockReturnValue(of('102'));
        // act
        writeManifest.execute(request).then(() => {
            expect(async1).toHaveBeenCalledWith('1024');
            expect(async2).toHaveBeenLastCalledWith('102');
        });
        // assert
    });

    it('should not be able to write a file if internal memory not availabe', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            ecarFilePath: 'ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: [{'size': 'sample'}],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        const async1 = (mockDeviceInfo.getAvailableInternalMemorySize as jest.Mock).mockReturnValue(of('-23'));
        (mockFileService.writeFile as jest.Mock).mockReturnValue(of('111'));
        // act
        writeManifest.execute(request).then(() => {
            expect(async1).toHaveBeenCalledWith('-23');
        });
        // assert
    });

});
