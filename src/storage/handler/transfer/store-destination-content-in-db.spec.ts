import {StoreDestinationContentInDb} from './store-destination-content-in-db';
import { AppConfig } from '../../../api/config/app-config';
import { FileService } from '../../../util/file/def/file-service';
import { DbService, DeviceInfo, ExistingContentAction } from '../../..';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';
import { of } from 'rxjs';

describe('StoreDestinationContentInDb', () => {
    let storeDestinationContentInDb: StoreDestinationContentInDb;
    const mockAppConfig: Partial<AppConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};

    beforeAll(() => {
        storeDestinationContentInDb = new StoreDestinationContentInDb(
            mockAppConfig as AppConfig,
            mockFileService as FileService,
            mockDbService as DbService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instanc of StoreDestinationContentInDb', () => {
        expect(storeDestinationContentInDb).toBeTruthy();
    });

    it('should added destination content in storage for higher version destination', (done) => {
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
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2'],
        };
        mockFileService.readAsText = jest.fn().mockImplementation(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass", "contentType":"Course"}]}}');
        readAsText().then((value) => {
            return value;
        });
        mockDbService.read = jest.fn().mockImplementation(() => {});
        (mockDbService.read as jest.Mock).mockReturnValue(of([]));
        mockFileService.getDirectorySize = jest.fn().mockImplementation(() => {});
        (mockFileService.getDirectorySize as jest.Mock).mockResolvedValue(1);
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => {});
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue('');
        mockDbService.beginTransaction = jest.fn().mockImplementation(() => {});
        mockDbService.insert = jest.fn().mockImplementation(() => {});
        (mockDbService.insert as jest.Mock).mockReturnValue(of(1));
        mockDbService.endTransaction = jest.fn().mockImplementation(() => {});
        // act
        storeDestinationContentInDb.execute(request).subscribe(() => {
            done();
        });
        // assert
    });

    it('should added destination content in storage for lower version destination', (done) => {
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
                status: MoveContentStatus.LOWER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID', ''],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_LOWER_VERSION,
            duplicateContents: dupContents,
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2'],
        };
        mockFileService.readAsText = jest.fn().mockImplementation(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass", "contentType":"Course"}]}}');
        readAsText().then((value) => {
            return value;
        });
        mockDbService.read = jest.fn().mockImplementation(() => {});
        (mockDbService.read as jest.Mock).mockReturnValue(of([]));
        mockFileService.getDirectorySize = jest.fn().mockImplementation(() => {});
        (mockFileService.getDirectorySize as jest.Mock).mockResolvedValue(1);
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => {});
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue('');
        mockDbService.beginTransaction = jest.fn().mockImplementation(() => {});
        mockDbService.insert = jest.fn().mockImplementation(() => {});
        (mockDbService.insert as jest.Mock).mockReturnValue(of(1));
        mockDbService.endTransaction = jest.fn().mockImplementation(() => {});
        // act
        storeDestinationContentInDb.execute(request).subscribe(() => {
            done();
        });
        // assert
    });

    it('should added destination content in storage for destination version', (done) => {
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
                status: MoveContentStatus.LOWER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID', ''],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_DESTINATION,
            duplicateContents: dupContents,
            validContentIdsInDestination: ['SAMPLE_CONTENT_1', 'SAMPLE_CONTENT_2'],
        };
        mockFileService.readAsText = jest.fn().mockImplementation(() => {});
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass", "contentType":"Course"}]}}');
        readAsText().then((value) => {
            return value;
        });
        mockDbService.read = jest.fn().mockImplementation(() => {});
        (mockDbService.read as jest.Mock).mockReturnValue(of([]));
        mockFileService.getDirectorySize = jest.fn().mockImplementation(() => {});
        (mockFileService.getDirectorySize as jest.Mock).mockResolvedValue(1);
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => {});
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue('');
        mockDbService.beginTransaction = jest.fn().mockImplementation(() => {});
        mockDbService.insert = jest.fn().mockImplementation(() => {});
        (mockDbService.insert as jest.Mock).mockReturnValue(of(1));
        mockDbService.endTransaction = jest.fn().mockImplementation(() => {});
        // act
        storeDestinationContentInDb.execute(request).subscribe(() => {
            done();
        });
        // assert
    });
});

