import { ValidateDestinationContent } from './validate-destination-content';
import { FileService } from '../../../util/file/def/file-service';
import { AppConfig } from '../../../api/config/app-config';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';
import { ExistingContentAction } from '../..';
import { Observable } from 'rxjs';

describe('ValidateDestinationContent', () => {
    let validateDestinationContent: ValidateDestinationContent;
    const mockFileService: Partial<FileService> = {};
    const mockAppConfig: Partial<AppConfig> = {};

    beforeAll(() => {
        validateDestinationContent = new ValidateDestinationContent(
            mockFileService as FileService,
            mockAppConfig as AppConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ValidateDestinationContent', () => {
        expect(validateDestinationContent).toBeTruthy();
    });

    it('should reading manifest and transfer content', () => {
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
        mockFileService.listDir = jest.fn().mockImplementation(() => { });
        (mockFileService.listDir as jest.Mock).mockResolvedValue(([
            {
                isFile: true,
                isDirectory: true,
                name: 'SCAN_STORAGE',
                fullPath: 'SAMPLE_FULL_PATH',
                nativeURL: ''
            }, {
                isFile: true,
                isDirectory: true,
                name: 'SCAN_STORAGE',
                fullPath: 'SAMPLE_FULL_PATH',
                nativeURL: ''
            }
        ]));
        mockFileService.readAsText = jest.fn().mockImplementation(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });
        // act
        validateDestinationContent.execute(request).subscribe(() => {

        });
        // assert
    });
});
