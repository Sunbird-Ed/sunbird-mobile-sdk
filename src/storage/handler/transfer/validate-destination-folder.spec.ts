import { ValidateDestinationFolder } from './validate-destination-folder';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';
import { ExistingContentAction } from '../..';

declare const sbutility;

describe('ValidateDestinationFolder', () => {
    let validateDestinationFolder: ValidateDestinationFolder;
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        validateDestinationFolder = new ValidateDestinationFolder(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ValidateDestinationFolder', () => {
        expect(validateDestinationFolder).toBeTruthy();
    });

    it('should create a directory and write ', (done) => {
        // arrange
        spyOn(sbutility, 'canWrite').and.callFake((a, b, c) => {
            setTimeout(() => {
                b();
                c();
            }, 0);
        });
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
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2'],
        };
        mockFileService.exists = jest.fn().mockImplementation(() => {});
        (mockFileService.exists as jest.Mock).mockResolvedValue({
            isFile: true,
            isDirectory: true,
            name: 'SCAN_STORAGE',
            fullPath: 'SAMPLE_FULL_PATH',
            nativeURL: ''
        });
        // act
        validateDestinationFolder.execute(request).subscribe(() => {
            done();
        });
        // assert
    });

    it('should create a directory and write ', (done) => {
        // arrange
        spyOn(sbutility, 'canWrite').and.callFake((a, b, c) => {
            setTimeout(() => {
                b();
                c();
            }, 0);
        });
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
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2'],
        };
        mockFileService.exists = jest.fn().mockImplementation(() => {});
        (mockFileService.exists as jest.Mock).mockRejectedValue({
            isFile: true,
            isDirectory: true,
            name: 'SCAN_STORAGE',
            fullPath: 'SAMPLE_FULL_PATH',
            nativeURL: ''
        });
        mockFileService.createDir = jest.fn().mockImplementation(() => {});
        (mockFileService.createDir as jest.Mock).mockResolvedValue({
            isFile: true,
            isDirectory: true,
            name: 'SCAN_STORAGE',
            fullPath: 'SAMPLE_FULL_PATH',
            nativeURL: ''
        });
        // act
        validateDestinationFolder.execute(request).subscribe(() => {
            done();
        });
        // assert
    });
});
