import { UpdateSourceContentPathInDb } from './update-source-content-path-in-db';
import { DbService, ExistingContentAction } from '../../..';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';

describe('UpdateSourceContentPathInDb', () => {
    let updateSourceContentPathInDb: UpdateSourceContentPathInDb;
    const mockDbService: Partial<DbService> = {
        beginTransaction: jest.fn().mockImplementation(() => {}),
        update: jest.fn().mockImplementation(() => {}),
        endTransaction: jest.fn().mockImplementation(() => {})
    };

    beforeAll(() => {
        updateSourceContentPathInDb = new UpdateSourceContentPathInDb(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of UpdateSourceContentPathInDb', () => {
        expect(updateSourceContentPathInDb).toBeTruthy();
    });

    it('should start transaction and end transaction and update the DB', () => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'SAMPLE_IDENTIFIER',
                status: MoveContentStatus.HIGHER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID', ''],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents,
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2']
        };
        // act
        updateSourceContentPathInDb.execute(request).subscribe(() => {

        });
        // assert
    });
});
