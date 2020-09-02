import {DuplicateContentCheck} from './duplicate-content-check';
import { DbService, ExistingContentAction } from '../../..';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';
import {DuplicateContentError} from '../../errors/duplicate-content-error';
import { Observable, of } from 'rxjs';

describe('DuplicateContentCheck', () => {
    let duplicateContentCheck: DuplicateContentCheck;
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        duplicateContentCheck = new DuplicateContentCheck(
            mockDbService as DbService,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of DuplicateContentCheck', () => {
        expect(duplicateContentCheck).toBeTruthy();
    });

    it('should update storage management', () => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            path: 'SAMPLE_PATH'
        }]));
        // act
        duplicateContentCheck.execute(request).subscribe(() => {

        });
        // assert
    });

    it('should update storage management', () => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
            contentIds: [],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents,
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2']
        };
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'LOCAL_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            path: 'SAMPLE_PATH'
        }]));
        mockFileService.readAsText = jest.fn().mockImplementation(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });
        // act
        duplicateContentCheck.execute(request).subscribe(null, (e) => {
            expect(e instanceof DuplicateContentError).toBeTruthy();
        });
    });
});
