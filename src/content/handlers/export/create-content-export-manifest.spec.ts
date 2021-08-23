import { DbService, ExportContentContext } from '../../..';
import { CreateContentExportManifest } from './create-content-export-manifest';
import { ImportNExportHandler } from '../import-n-export-handler';
import { ContentEntry } from '../../db/schema';
import { of } from 'rxjs';

declare var require;

describe('CreateContentExportManifest', () => {
    let createContentExportManifest: CreateContentExportManifest;

    const mockDbService: Partial<DbService> = {};
    const mockImportNExportHandler: Partial<ImportNExportHandler> = {};

    beforeAll(() => {
       
        createContentExportManifest = new CreateContentExportManifest(
            mockDbService as DbService,
            mockImportNExportHandler as ImportNExportHandler
        );
    });

    beforeEach(() => {
        window['device'] = { uuid: 'some_uuid', platform:'android' };
        jest.clearAllMocks();
    });

    it('should be create a instance of createContentExportManifest', () => {
        expect(createContentExportManifest).toBeTruthy();
    });

    it('shold export Ecar feature', () => {
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
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        mockImportNExportHandler.populateItems = jest.fn().mockImplementation(() => of([]));
        // act
        createContentExportManifest.execute(request).then(() => {
        });
        // assert
    });
});
