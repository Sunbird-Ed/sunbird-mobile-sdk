import { DeleteTempEcar } from './delete-temp-ecar';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../db/schema';
import { ExportContentContext } from '../..';

describe('DeleteTempEcar', () => {
    let deleteTempEcar: DeleteTempEcar;
    const mockFileService: Partial<FileService> = {
        removeRecursively: jest.fn().mockImplementation(() => {})
    };

    beforeAll(() => {
        deleteTempEcar = new DeleteTempEcar(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of deleteTempEcar', () => {
        expect(deleteTempEcar).toBeTruthy();
    });

    it('should remove file recursivly', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        (mockFileService.removeRecursively as jest.Mock).mockResolvedValue({'success': 'REMOVE_SUCCESS', 'fileRemoved': {}});
        // act
        deleteTempEcar.execute(request).then(() => {});
        // assert
    });

    it('should remove file recursivly for error part', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        (mockFileService.removeRecursively as jest.Mock).mockRejectedValue('SAMPLE_TEMP_PATH');
        // act
        deleteTempEcar.execute(request).catch(() => {});
        // assert
    });
});
