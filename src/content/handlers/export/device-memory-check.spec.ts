import {DeviceMemoryCheck} from './device-memory-check';
import {FileService} from '../../../util/file/def/file-service';
import {ContentEntry} from '../../db/schema';
import {ExportContentContext} from '../..';

describe('DeviceMemoryCheck', () => {
    let deviceMemoryCheck: DeviceMemoryCheck;
    const mockFileService: Partial<FileService> = {
        getFreeDiskSpace: jest.fn().mockImplementation(() => {
        })
    };

    beforeAll(() => {
        deviceMemoryCheck = new DeviceMemoryCheck(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of deviceMemoryCheck', () => {
        expect(deviceMemoryCheck).toBeTruthy();
    });

    it('should free space in memory', () => {
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
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: [{'size': 'sample'}],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        (mockFileService.getFreeDiskSpace as jest.Mock).mockResolvedValue(1);
        // act
        deviceMemoryCheck.execute(request).then(() => {
        });
        // assert
    });


    it('should free space in memory', () => {
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
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            // items: ['artifactUrl'],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        (mockFileService.getFreeDiskSpace as jest.Mock).mockResolvedValue(1);
        // act
        deviceMemoryCheck.execute(request).then(() => {
        });
        // assert
    });
});
