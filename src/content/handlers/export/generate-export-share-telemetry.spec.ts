import { GenerateExportShareTelemetry } from './generate-export-share-telemetry';
import { ContentEntry } from '../../db/schema';
import { ExportContentContext, ContentExportRequest } from '../..';
import { TelemetryService } from '../../../telemetry';
import { of } from 'rxjs';

describe('GenerateExportShareTelemetry', () => {
    let generateExportShareTelemetry: GenerateExportShareTelemetry;
    const mockTelemetryService: Partial<TelemetryService> = {
        share: jest.fn().mockImplementation(() => {
        })
    };

    beforeAll(() => {
        generateExportShareTelemetry = new GenerateExportShareTelemetry(
            mockTelemetryService as TelemetryService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of GenerateExportShareTelemetry', () => {
        expect(generateExportShareTelemetry).toBeTruthy();
    });

    it('should share telemetry event', (done) => {
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
            items: [{ 'size': 'sample' }],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        const data: ContentExportRequest = {
            destinationFolder: 'dest-folder',
            contentIds: ['id'],
            saveLocally: true
        };
        const fileName = 'sample-file-name';
        (mockTelemetryService.share as jest.Mock).mockReturnValue(of(false));
        // act
        generateExportShareTelemetry.execute(request, fileName, data).then(() => {
            // assert
            expect(mockTelemetryService.share).toHaveBeenCalled();
            done();
        });
    });

    it('should share telemetry event for error part', (done) => {
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
            // ecarFilePath: 'ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: [{ 'size': 'sample' }],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        const data: ContentExportRequest = {
            destinationFolder: 'dest-folder',
            contentIds: ['id'],
            saveLocally: true
        };
        const fileName = 'sample-file-name';
        (mockTelemetryService.share as jest.Mock).mockReturnValue(of(1));
        // act
        generateExportShareTelemetry.execute(request, fileName, data).then(() => {
             // assert
             expect(mockTelemetryService.share).toHaveBeenCalled();
            done();
        });
    });
});
