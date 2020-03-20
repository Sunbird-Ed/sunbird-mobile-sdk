import { ValidateEcar } from './validate-ecar';
import { FileService } from '../../../util/file/def/file-service';
import { DbService, ContentImportResponse, ContentImportStatus, ImportContentContext } from '../../..';
import { AppConfig } from '../../../api/config/app-config';
import { GetContentDetailsHandler } from '../get-content-details-handler';
import { of } from 'rxjs';

describe('ValidateEcar', () => {
    let validateEcar: ValidateEcar;
    const mockFileService: Partial<FileService> = {
        readAsText: jest.fn().mockImplementation(() => { }),
        removeRecursively: jest.fn().mockImplementation(() => { })
    };
    const mockDbService: Partial<DbService> = {};
    const mockAppConfig: Partial<AppConfig> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {
        fetchFromDBForAll: jest.fn().mockImplementation(() => { })
    };

    beforeAll(() => {
        validateEcar = new ValidateEcar(
            mockFileService as FileService,
            mockDbService as DbService,
            mockAppConfig as AppConfig,
            mockGetContentDetailsHandler as GetContentDetailsHandler
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create an instance of ValidateEcar', () => {
        expect(validateEcar).toBeTruthy();
    });

    it('should read as text and remove recursivly', async (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: { 'identifier': true }
        };
        // act
        await validateEcar.execute(request).catch(() => {
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly ', async (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: { 'identifier': true },
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": ["item_1"]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }]));
        // console.log(J);
        // act
        await validateEcar.execute(request).then(() => {
            done();
        });
        // assert
    });

    it('should faild import unsupported mainfest for archive items false', async (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            existedContentIdentifiers: { 'identifier': true },
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": false}}');
        const data = readAsText().then((value) => {
            return value;
        });

        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }]));

        // act
        await validateEcar.execute(request).catch(() => {
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for manifestJson.ver error', async (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: { 'identifier': true },
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": 1.0}');
        const data = readAsText().then((value) => {
            return value;
        });
       // (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{}]));
        // console.log(J);
        // act
        await validateEcar.execute(request).catch(() => {
            done();
        });
        // assert
    });

    it('should faild import unsupported mainfest for archive items false', async (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            existedContentIdentifiers: { 'identifier': true },
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock)
        .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });

        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }]));

        // act
        await validateEcar.execute(request).then(() => {
            done();
        });
        // assert
    });
});
