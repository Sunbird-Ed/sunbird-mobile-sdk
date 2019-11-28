import {EcarBundle} from './ecar-bundle';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../db/schema';
import { ExportContentContext } from '../..';
import { ZipService } from '../../../util/zip/def/zip-service';
import { async } from 'rxjs/internal/scheduler/async';
describe('EcarBundle', () => {
    let ecarBundle: EcarBundle;
    const mockFileService: Partial<FileService> = {
        getMetaData: jest.fn(() => {})
    };
    const mockZipService: Partial<ZipService> = {
        zip: jest.fn(() => {})
    };

    beforeAll(() => {
        ecarBundle = new EcarBundle(
         mockFileService as FileService,
         mockZipService as ZipService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create instance of ecarBundle', () => {
        expect(ecarBundle).toBeTruthy();
    });

    it('should be zip file', async(done) => {
        // arrange
        spyOn(mockZipService, 'zip').and.callFake(
            (a, b, c, d, e, f) => {
                setTimeout(() => {
                    e();
                }, 0);
            }
        );
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
            ecarFilePath: 'ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: [{'size': 'sample'}],
            metadata: { 'SAMPLE_KEY': 'SAMPLE_META_DATA' },

        };
        (mockFileService.getMetaData as jest.Mock).mockResolvedValue('');
        // act
        await ecarBundle.execute(request).then(() => {
            done();
        });
        // assert
    });
});
