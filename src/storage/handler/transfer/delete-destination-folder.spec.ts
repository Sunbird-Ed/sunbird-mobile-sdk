import {DeleteDestinationFolder} from './delete-destination-folder';
import { TransferContentContext } from '../transfer-content-handler';
import { ContentEntry } from '../../../content/db/schema';

describe('DeleteDestinationFolder', () => {
    let deleteDestinationFolder: DeleteDestinationFolder;

    beforeAll(() => {
        deleteDestinationFolder = new DeleteDestinationFolder(

        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should transfer content context', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: true,
        };

        deleteDestinationFolder.execute(request).subscribe(() => {
            done();
        });
    });
});
