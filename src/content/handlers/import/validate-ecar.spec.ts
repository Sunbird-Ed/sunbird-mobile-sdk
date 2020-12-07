import {ValidateEcar} from './validate-ecar';
import {FileService} from '../../../util/file/def/file-service';
import {ContentImportResponse, ContentImportStatus, DbService, ImportContentContext} from '../../..';
import {AppConfig} from '../../../api/config/app-config';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {of} from 'rxjs';
import {ContentUtil} from '../../util/content-util';

describe('ValidateEcar', () => {
    let validateEcar: ValidateEcar;
    const mockFileService: Partial<FileService> = {
        readAsText: jest.fn().mockImplementation(() => {
        }),
        removeRecursively: jest.fn().mockImplementation(() => {
        })
    };
    const mockDbService: Partial<DbService> = {};
    const mockAppConfig: Partial<AppConfig> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {
        fetchFromDBForAll: jest.fn().mockImplementation(() => {
        })
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true}
        };
        // act
        await validateEcar.execute(request).catch((e) => {
            expect(e._errorMesg).toBe('IMPORT_FAILED_MANIFEST_FILE_NOT_FOUND');
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for NOT_COMPATIBLE ', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "item_1", "status": "valid"}]}}');
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
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for status CONTENT_EXPIRED', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "item_1", "status": "valid"}]}}');
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
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(true);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for status CONTENT_EXPIRED and visibilty is not default', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "item_1", "status": "valid"}]}}');
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
        jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue('set');
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(true);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly if isRootExists to false', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"id": "s-id", "status": "valid", "pkgVersion": 3}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["identifier"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2,
            path: 'sample-path'
        }]));
        jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue('set');
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            expect(ContentUtil.isDraftContent).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly if existingContentModel is undefined', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"id": "s-id", "status": "valid", "pkgVersion": 3}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["identifier"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2,
            path: 'sample-path'
        }]));
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly if existingContentPath is undefined', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "identifier", "status": "valid", "pkgVersion": 3}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["1"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2
        }]));
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for status ALREADY_EXIST', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "identifier", "status": "valid", "pkgVersion": 3}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["1"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2,
            path: 'sample-path'
        }]));
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(true);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly for status ALREADY_EXIST and multiple items', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "identifier", "status": "valid", "pkgVersion": 3}, {"identifier": "identifier"}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["1"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2,
            path: 'sample-path'
        }]));
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(true);
        // console.log(J);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should read as text and remove recursivly if existingContentPath is undefined', async (done) => {
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {identifier: true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"identifier": "identifier", "status": "valid", "pkgVersion": 3}]}}');
        const data = readAsText().then((value) => {
            return value;
        });
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'identifier',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123", "pkgVersion": 1, "childNodes": ["identifier"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            ref_count: 2,
            path: 'sample-path'
        }]));
        jest.spyOn(ContentUtil, 'isDraftContent').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isExpired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isDuplicateCheckRequired').mockReturnValue(false);
        jest.spyOn(ContentUtil, 'isImportFileExist').mockReturnValue(false);
        // console.log(J);
        // act
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
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
            contentIdsToDelete: new Set(),
            existedContentIdentifiers: {'identifier': true},
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
        await validateEcar.execute(request).catch((e) => {
            expect(e._errorMesg).toBe('IMPORT_FAILED_NO_CONTENT_METADATA');
            expect(mockFileService.readAsText).toHaveBeenCalled();
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
            contentIdsToDelete: new Set(),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier': true},
            skippedItemsIdentifier: ['skipped']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock).mockResolvedValue('{"ver": 1.0}');
        const data = readAsText().then((value) => {
            return value;
        });
        // act
        await validateEcar.execute(request).catch((e) => {
            expect(e._errorMesg).toBe('IMPORT_FAILED_UNSUPPORTED_MANIFEST');
            expect(mockFileService.readAsText).toHaveBeenCalled();
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
            contentIdsToDelete: new Set(),
            existedContentIdentifiers: {'identifier': true},
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
        await validateEcar.execute(request).then((val) => {
            expect(val.body).toBe(request);
            expect(mockFileService.readAsText).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
            done();
        });
        // assert
    });
});
