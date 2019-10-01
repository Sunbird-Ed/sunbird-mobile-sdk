import { DbService, ExportContentContext } from '../../..';
import { CreateContentExportManifest } from './create-content-export-manifest';
import { ImportNExportHandler } from '../import-n-export-handler';
import { ContentEntry } from '../../db/schema';
import { Observable } from 'rxjs';
import moment = require('moment');

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
        jest.clearAllMocks();
    });

    // jest.mock('moment', () => () => ({
    //     format: () => '2019–09–27T10:34:56+00:00'
    //   }));

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
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }];
        const request: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        mockImportNExportHandler.populateItems = jest.fn(() => Observable.of([]));
        // act
        createContentExportManifest.execute(request).then(() => {
        // expect(moment.format).toHaveBeenCalled();
        });
        // assert
    });
});
