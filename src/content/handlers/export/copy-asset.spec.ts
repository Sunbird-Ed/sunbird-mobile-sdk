import {CopyAsset} from './copy-asset';
import {ContentEntry} from '../../db/schema';
import {ExportContentContext} from '../..';

declare const sbutility;

describe('CopyAsset', () => {
    let copyAsset: CopyAsset;

    beforeAll(() => {
        copyAsset = new CopyAsset();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of copy asset', () => {
        expect(copyAsset).toBeTruthy();
    });

    it('should be copied a file by invoked exicute() for error MEssage', async (done) => {
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
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
            subContentIds: ['IDENTIFIER']
        };
        // act
        await copyAsset.execute(request).catch(() => {
            done();
        });
        // assert
    });

    it('should be copied a file by invoked exicute() if subCollectionIds is not matched', async (done) => {
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
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
            subContentIds: ['id']
        };
        // act
        await copyAsset.execute(request).catch(() => {
            done();
        });
        // assert
    });

    it('should be copied a file by invoked exicute()', async (done) => {
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
            items: [{
                appIcon: 'sample-app-icon',
                itemSetPreviewUrl: 'http:///do_123',
                contentDisposition: 'inline',
                contentEncoding: 'identify',
                artifactUrl: 'http:///do_123'
            }],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
        };
        sbutility.copyFile = jest.fn((_, __, ___, cb, err) => cb({id: 'sample-id'}));
        // act
        await copyAsset.execute(request).then((d) => {
            // assert
            expect(d.body).toBeTruthy();
            expect(sbutility.copyFile).toBeTruthy();
            done();
        });
    });

    it('should be copied a file for sbutility plugin error', async (done) => {
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
            items: [{
                appIcon: 'sample-app-icon',
                itemSetPreviewUrl: 'http:///do_123',
                contentDisposition: 'inline',
                contentEncoding: 'identity',
                artifactUrl: 'http:///do_123'
            }],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
        };
        sbutility.copyFile = jest.fn((_, __, ___, cb, err) => err({error: 'sample-error'}));
        // act
        await copyAsset.execute(request).then((e) => {
            // assert
            expect(e.body).toBeTruthy();
            expect(sbutility.copyFile).toBeTruthy();
            done();
        });
    });
});
