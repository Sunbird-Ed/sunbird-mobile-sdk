import {CompressContent} from './compress-content';
import {ZipService} from '../../../util/zip/def/zip-service';
import {ExportContentContext} from '../..';
import {ContentEntry} from '../../db/schema';

declare const ZipService;
describe('CompressContent', () => {
    let compressContent: CompressContent;
    const mockZipService: Partial<ZipService> = {
        zip: jest.fn().mockImplementation(() => {
        })
    };

    beforeAll(() => {
        compressContent = new CompressContent(
            mockZipService as ZipService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        //   jest.setTimeout(5000);
    });

    it('should be create a instance of zip unZip', () => {
        expect(compressContent).toBeTruthy();
    });

    it('should create unZip file to zip file', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            primary_category: 'textbook'
        }];
        const exportContentContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: {'SAMPLE_KEY': 'KEY_VALUE'}
        };
        // act
        await compressContent.execute(exportContentContext).then(() => {
            done();
        });
        // arrange
    });

    it('should create unZip file to zip file', async (done) => {
        // arrange
        spyOn(mockZipService, 'zip').and.callFake(
            (a, b, c, d, e, f) => {
                setTimeout(() => {
                    e();
                    f();
                }, 0);
            }
        );
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const exportContentContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TMP_LOCATION_PATH',
            contentModelsToExport: request,
            metadata: {'SAMPLE_KEY': 'KEY_VALUE'}
        };
        // act
        await compressContent.execute(exportContentContext).then(() => {
            done();
        }, );
        // arrange
    });

});

