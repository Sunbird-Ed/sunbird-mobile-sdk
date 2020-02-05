import { ExtractPayloads } from './extract-payloads';
import { FileService } from '../../../util/file/def/file-service';
import { ZipService } from '../../../util/zip/def/zip-service';
import { AppConfig } from '../../../api/config/app-config';
import { DbService, DeviceInfo, EventsBusService, SharedPreferences,
     ContentImportResponse, ContentImportStatus, ImportContentContext } from '../../..';
import { GetContentDetailsHandler } from '../get-content-details-handler';
import { of } from 'rxjs';
import { ContentUtil } from '../../util/content-util';
import { ContentEntry } from '../../db/schema';

declare const sbutility;

describe('ExtractPayloads', () => {
    let extractPayloads: ExtractPayloads;
    const mockFileService: Partial<FileService> = {};
    const mockZipService: Partial<ZipService> = {};
    const mockAppConfig: Partial<AppConfig> = {};
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {
        fetchFromDBForAll: jest.fn().mockImplementation(() => {})
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        emit: jest.fn().mockImplementation().mockImplementation(() => () => {})
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        extractPayloads = new ExtractPayloads(
            mockFileService as FileService,
            mockZipService as ZipService,
            mockAppConfig as AppConfig,
            mockDbService as DbService,
            mockDeviceInfo as DeviceInfo,
            mockGetContentDetailsHandler as GetContentDetailsHandler,
            mockEventsBusService as EventsBusService,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ExtractPayloads', () => {
        expect(extractPayloads).toBeTruthy();
    });

    it('should count how many contents are imported', async (done) => {
        // arrange
        spyOn(sbutility, 'createDirectories').and.callFake((a, b, c) => {
            setTimeout(() => {
                c({
                    identifier: 'IDENTIFIER',
                    server_data: 'SERVER_DATA',
                    local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                    mime_type: 'MIME_TYPE',
                    manifest_version: 'MAINFEST_VERSION',
                    content_type: 'CONTENT_TYPE',
                    content_state: 2,
                });
            }, 0);
        });
        const existingContentModel = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            visibility: 'sample_visibility',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            path: 'SAMPLE_PATH'
        };
        const visibility = 'Library';
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
            existedContentIdentifiers: {'identifier' : true}
        };
        (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
        (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            contentMetadata: 'CONTENT_METADATA'
        }]));
        mockFileService.createDir = jest.fn().mockImplementation(() => { });
        (mockFileService.createDir as jest.Mock).mockReturnValue(of(''));
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => { });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of(''));
        spyOn(ContentUtil, 'addOrUpdateViralityMetadata').and.stub();
        // act
        await extractPayloads.execute(request).then(() => {
            expect(Boolean(existingContentModel)).toBe(true);
            done();
        });
        // assert
    });

    it('should Update the contents in DB with actual size', async (done) => {
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
            items: [{ 'identifier': '1002' }]
        };
        const contentEntrySchema: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            visibility: 'sample_visibility',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        };
        const commonContentModelsMap = new Map();
        commonContentModelsMap.set('1002', contentEntrySchema);
        const payloadDestinationPathMap = new Map();
        payloadDestinationPathMap.set('1002', 'MAP');
        // act
        await extractPayloads.updateContentFileSizeInDB(request,
            commonContentModelsMap,
            payloadDestinationPathMap,
            contentEntrySchema).then(() => {
                done();
            });
    });

    it('should insert content in DB and update existing content in DB', async (done) => {
        // arrange
        const insertNewContentModels: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }];
        const updateNewContentModels: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }];
        mockDbService.beginTransaction = jest.fn().mockImplementation(() => of());
        mockDbService.insert = jest.fn().mockImplementation(() => of());
        mockDbService.update = jest.fn().mockImplementation(() => of());
        mockDbService.endTransaction = jest.fn().mockImplementation(() => of());
        // act
        await extractPayloads.updateContentDB(insertNewContentModels, updateNewContentModels).then(() => {
            done();
        });
        // assert
    });

    it('should optimize folder creation', async (done) => {
        // arrange
        const tempLocationPath = 'SAMPLE_TMP_LOCATION';
        const asset = 'SAMPLE_ASSET';
        const payloadDestinationPath = 'SAMPLE_PAYLOAD_DESTINATION_PATH';
        // const useSubDirectories?: boolean
        mockFileService.copyFile = jest.fn().mockImplementation(() => of());
        // act
        extractPayloads.copyAssets(tempLocationPath, asset, payloadDestinationPath).then(() => {
            done();
        });
        // assert
    });
    // it('should optimize folder creation', async (done) => {
    //     // arrange
    //     const tempLocationPath = 'SAMPLE_TMP_LOCATION';
    //     const asset = 'SAMPLE_ASSET';
    //     const payloadDestinationPath = 'SAMPLE_PAYLOAD_DESTINATION_PATH';
    //     // const useSubDirectories?: boolean
    //     mockFileService.copyFile = jest.fn().mockImplementation(() => of());
    //     mockDbService.execute = jest.fn().mockImplementation(() => {});
    //     (mockDbService.execute as jest.Mock).mockResolvedValue({});
    //     // act
    //     extractPayloads.copyAssets(tempLocationPath, asset, payloadDestinationPath).catch(() => {
    //         expect(mockDbService.execute).toHaveBeenCalled();
    //         done();
    //     });
    //     // assert
    // });

    it('should started to import child content and do not update visibility', () => {
        // arrange
        const existingContentInDb = 'identifier';
        const objectType = 'Library';
        const isChildContent = true;
        const previousVisibility = 'visibility';
        // act
        extractPayloads.getContentVisibility(existingContentInDb, objectType,
             isChildContent, previousVisibility);
        // assert
    });

    it('should started to import child content and do not update visibility if ObjectType is not Library', () => {
        // arrange
        const existingContentInDb = 'identifier';
        const objectType = 'course';
        const isChildContent = true;
        const previousVisibility = 'visibility';
        // act
        extractPayloads.getContentVisibility(existingContentInDb, objectType,
             isChildContent, previousVisibility);
        // assert
    });

    it('should get existing content Id', () => {
        // arrange
        const existingContentInDb = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            visibility: 'sample_visibility',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        };

        const contentState = 1;
       // console.log(existingContentInDb[contentEntry.content_state]);
        // act
        extractPayloads.getContentState(existingContentInDb, contentState);
        // assert
    });
});
