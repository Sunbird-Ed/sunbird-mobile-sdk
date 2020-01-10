import { CopyToDestination } from './copy-to-destination';
import {FileService} from '../../../util/file/def/file-service';
import {ContentEntry} from '../../db/schema';
import {Response} from '../../../api'

describe('CopyToDestination', () => {
    let copyToDestination: CopyToDestination;
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        copyToDestination = new CopyToDestination();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of copy asset', () => {
        expect(copyToDestination).toBeTruthy();
    });

    it('should be copied a file by invoked exicute() for error MEssage', async (done) => {
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

        const exportContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
            ecarFilePath: 'sampledir/samplefile'
        };
        const contentExportRequest = {
            destinationFolder: 'dest-folder',
            contentIds: ['']
        };
        const response: Response = new Response();

        response.body = exportContext;
        // act
        await copyToDestination.execute(response, contentExportRequest).then((result) => {
            // assert
            expect(result).toEqual(response);
            done();
        });
    });

    it('should be copied a file by invoked exicute() for error MEssage', async (done) => {
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

        const exportContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},
            ecarFilePath: 'sampledir/samplefile'
        };
        const contentExportRequest = {
            destinationFolder: 'dest-folder',
            contentIds: ['']
        };
        const response: Response = new Response();

        response.body = exportContext;
        // act
        await copyToDestination.execute(response, contentExportRequest).catch((result) => {
            // assert
            done();
        });
    });

});
