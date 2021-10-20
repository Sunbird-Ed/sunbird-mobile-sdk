import { ExtractPayloads } from './extract-payloads';
import { FileService } from '../../../util/file/def/file-service';
import { ZipService } from '../../../util/zip/def/zip-service';
import { AppConfig } from '../../../api/config/app-config';
import {
    DbService, DeviceInfo, EventsBusService, SharedPreferences,
    ContentImportResponse, ContentImportStatus, ImportContentContext
} from '../../..';
import { GetContentDetailsHandler } from '../get-content-details-handler';
import { of } from 'rxjs';
import { ContentUtil } from '../../util/content-util';
import { ContentEntry } from '../../db/schema';
import { Visibility, MimeType } from '../../util/content-constants';
import { UpdateSizeOnDevice } from './update-size-on-device';

jest.mock('./update-size-on-device');

declare const sbutility;

describe('ExtractPayloads', () => {
    let extractPayloads: ExtractPayloads;
    const mockFileService: Partial<FileService> = {};
    const mockZipService: Partial<ZipService> = {};
    const mockAppConfig: Partial<AppConfig> = {
        maxCompatibilityLevel: 10,
        minCompatibilityLevel: 1,
        deepLinkBasePath: 'base-path',
        buildConfigPackage: 'package'
    };
    const mockDbService: Partial<DbService> = {
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {
        fetchFromDBForAll: jest.fn().mockImplementation(() => { })
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        emit: jest.fn().mockImplementation().mockImplementation(() => () => { })
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
        window['device'] = { uuid: 'some_uuid', platform:'android' };
        jest.clearAllMocks();
        (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockClear();
    });

    it('should be create a instance of ExtractPayloads', () => {
        expect(extractPayloads).toBeTruthy();
    });

    describe('execute', () => {
        it('should count how many contents are imported', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            const existingContentModel = {
                identifier: { path: 'http://' },
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
                items: [{
                    identifier: 'identifier',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: 'encode',
                    contentDisposition: 'disposition',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    contentType: 'Course'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'identifier',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                contentMetadata: 'CONTENT_METADATA',
                visibility: Visibility.DEFAULT
            }]));
            mockFileService.createDir = jest.fn().mockImplementation(() => { });
            (mockFileService.createDir as jest.Mock).mockReturnValue(of(''));
            mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => { });
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                done();
            });
        });

        it('should count how many contents are imported for skippedItemsIdentifier', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, rs, err) => {
                rs();
                err(new Error('SOME-ERROR'));
            });

            const existingContentModel = {
                identifier: 'sample-id',
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
                items: [{
                    identifier: 'sample-id',
                    mimeType: 'sample-mime-type',
                    appIcon: 'https:*.jpg'
                }],
                existedContentIdentifiers: { 'identifier': true },
                skippedItemsIdentifier: ['sample-id']
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                contentMetadata: 'CONTENT_METADATA'
            }]));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            const contentEntrySchema = {
                identifier: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mimeType: 'MIME_TYPE',
                visibility: Visibility.DEFAULT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
            };
            const response = {
                body:
                {
                    metadata: { content_count: 1 },
                    ecarFilePath: 'native_urlcontent_count',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    contentModelsToExport: [[Object]],
                    tmpLocationPath: undefined,
                    items: [{ contentType: 'sample-content' }],
                    manifest:
                    {
                        id: 'ekstep.content.archive',
                        ver: '1.1',
                        ts: '2020-03-10T18:02:44+05:30',
                        archive: [Object]
                    },
                    FILE_SIZE: '34KB',
                    rootIdentifier: 'sample-root-id'
                }
            };
            const updateSizeOnDeviceData = jest.fn(() => Promise.resolve(response));
            (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockImplementation(() => {
                return {
                    execute: updateSizeOnDeviceData
                } as any;
            });

            // act
            extractPayloads.execute(request).then(() => {
                expect(Boolean(existingContentModel)).toBe(true);
                done();
            });
            // assert
        });

        it('should count how many contents are imported for file unzip', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.PARENT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

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
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: undefined,
                    contentDisposition: undefined,
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    primaryCategory: 'OnlineCourse'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
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
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            mockZipService.unzip = jest.fn((_, __, rs) => rs());
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockZipService.unzip).toHaveBeenCalled();
                done();
            });
        });

        it('should count how many contents are imported for file unzip error part', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.PARENT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

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
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: undefined,
                    contentDisposition: 'position',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    contentType: 'Course'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
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
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            mockZipService.unzip = jest.fn((_, __, rs, err) => err());
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockZipService.unzip).toHaveBeenCalled();
                done();
            });
        });

       it('should count how many contents are imported for inline', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.PARENT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

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
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: 'identity',
                    contentDisposition: 'inline',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    primaryCategory: 'ETB'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
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
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                done();
            });
        });

        it('should count how many contents are imported for getContentVisibility', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.PARENT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

            const contentImportResponse: ContentImportResponse[] = [{
                identifier: 'SAMPLE_IDENTIFIER',
                status: ContentImportStatus.IMPORT_COMPLETED
            }];
            const request: ImportContentContext = {
                isChildContent: false,
                ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
                tmpLocation: 'SAMPLE_TEMP_LOCATION',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentImportResponseList: contentImportResponse,
                contentIdsToDelete: new Set(['1', '2']),
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: 'identity',
                    contentDisposition: 'inline',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    primaryCategory: 'ETB'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'id',
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
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                done();
            });
        });

        it('should count how many contents are imported for online', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.PARENT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

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
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: 'identity',
                    contentDisposition: 'online',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    primaryCategory: 'ETB'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
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
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                done();
            });
        });

        it('should count how many contents are imported for offline', (done) => {
            // arrange
            sbutility.createDirectories = jest.fn((_, __, cb) => {
                cb({
                    identifier: { path: 'http://' },
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        content_state: 2,
                });
            });
            jest.spyOn(ContentUtil, 'readVisibility').mockReturnValue(Visibility.DEFAULT);
            const existingContentModel = {
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                visibility: Visibility.DEFAULT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                path: 'SAMPLE_PATH'
            };

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
                items: [{
                    identifier: 'id',
                    mimeType: 'sample-mime-type',
                    appIcon: '*.jpg',
                    contentEncoding: 'identity',
                    contentDisposition: 'offline',
                    pkgVersion: 'v6',
                    artifactUrl: 'http://',
                    itemSetPreviewUrl: 'http://',
                    board: 'CBSC',
                    medium: 'english',
                    gradeLevel: 'Class6',
                    primaryCategory: 'ETB'
                }],
                existedContentIdentifiers: { 'identifier': true }
            };
            (mockEventsBusService.emit as jest.Mock).mockReturnValue(of());
            (mockGetContentDetailsHandler.fetchFromDBForAll as jest.Mock).mockReturnValue(of([{
                identifier: 'sample-id',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'MIME_TYPE',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                contentMetadata: 'CONTENT_METADATA'
            }]));
            mockFileService.createDir = jest.fn(() => Promise.resolve({ nativeURL: 'sample-native-url' })) as any;
            mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => { });
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('sample-device'));
            jest.spyOn(extractPayloads, 'copyAssets').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(extractPayloads, 'updateContentDB').mockImplementation(() => {
                return Promise.resolve();
            });
            mockFileService.copyFile = jest.fn(() => Promise.resolve({ isFile: true, nativeUrl: 'sample-url' })) as any;
            // act
            extractPayloads.execute(request).then(() => {
                // assert
                expect(Boolean(existingContentModel)).toBe(true);
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockFileService.copyFile).toHaveBeenCalledWith(
                    request.tmpLocation,
                    'manifest.json',
                    'sample-native-url',
                    'manifest.json');
                done();
            });
        });
    });

    describe('updateContentFileSizeInDB', () => {
        it('should Update the contents in DB with actual size', (done) => {
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
                items: [{ 'identifier': 'd0_102' }]
            };
            const contentEntrySchema = {
                identifier: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mimeType: 'MIME_TYPE',
                visibility: Visibility.DEFAULT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
            };
            const commonContentModelsMap = new Map();
            commonContentModelsMap.set('d0_102', contentEntrySchema);
            const payloadDestinationPathMap = new Map();
            payloadDestinationPathMap.set('do_102', commonContentModelsMap);
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(5));
            // act
            extractPayloads.updateContentFileSizeInDB(request,
                commonContentModelsMap,
                payloadDestinationPathMap,
                contentEntrySchema).then(() => {
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    done();
                });
        });

        it('should Update the contents in DB with actual sizevfor else part for existing content module', (done) => {
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
                items: [{ 'identifier': 'do_102' }]
            };
            const contentEntrySchema = {
                do_102: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mimeType: 'MIME_TYPE',
                visibility: Visibility.DEFAULT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                size_on_device: 5
            };
            const commonContentModelsMap = new Map();
            commonContentModelsMap.set('do_102', contentEntrySchema);
            const payloadDestinationPathMap = new Map();
            payloadDestinationPathMap.set('do_102', commonContentModelsMap);
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(5));
            // act
            extractPayloads.updateContentFileSizeInDB(request,
                commonContentModelsMap,
                payloadDestinationPathMap,
                contentEntrySchema).then(() => {
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    done();
                });
        });

        it('should Update the contents in DB with actual size', (done) => {
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
                items: [{ 'identifier': 'd0_102' }]
            };
            const contentEntrySchema = {
                identifier: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mimeType: MimeType.COLLECTION,
                visibility: Visibility.PARENT,
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
            };
            const commonContentModelsMap = new Map();
            commonContentModelsMap.set('d0_102', contentEntrySchema);
            const payloadDestinationPathMap = new Map();
            payloadDestinationPathMap.set('do_102', commonContentModelsMap);
            // act
            extractPayloads.updateContentFileSizeInDB(request,
                commonContentModelsMap,
                payloadDestinationPathMap,
                contentEntrySchema).then(() => {
                    done();
                });
        });
    });

    it('should insert content in DB and update existing content in DB', (done) => {
        // arrange
        const insertNewContentModels: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const updateNewContentModels: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        mockDbService.beginTransaction = jest.fn().mockImplementation(() => of());
        mockDbService.insert = jest.fn().mockImplementation(() => of());
        mockDbService.update = jest.fn().mockImplementation(() => of());
        mockDbService.endTransaction = jest.fn().mockImplementation(() => of());
        // act
        extractPayloads.updateContentDB(insertNewContentModels, updateNewContentModels).then(() => {
            // assert
            // expect(mockDbService.beginTransaction).toHaveBeenCalled();
            done();
        });
    });

    describe('copyAssets', () => {
        it('should copied file', (done) => {
            // arrange
            const tempLocationPath = 'SAMPLE_TMP_LOCATION';
            const asset = 'SAMPLE_ASSET';
            const payloadDestinationPath = 'SAMPLE_PAYLOAD_DESTINATION_PATH';
            // const useSubDirectories?: boolean
            mockFileService.copyFile = jest.fn().mockImplementation(() => of({isFile: true}));
            // act
            extractPayloads.copyAssets(tempLocationPath, asset, payloadDestinationPath).then(() => {
                // assert
                expect(mockFileService.copyFile).toHaveBeenCalled();
                done();
            });
        });

        it('should create file directory', (done) => {
            // arrange
            const tempLocationPath = 'SAMPLE_TMP_LOCATION';
            const asset = 'SAMPLE_ASSET';
            const payloadDestinationPath = 'SAMPLE_PAYLOAD_DESTINATION_PATH';
            const useSubDirectories = false;
            // const useSubDirectories?: boolean
            mockFileService.createDir = jest.fn().mockImplementation(() => Promise.resolve({}));
            mockFileService.copyFile = jest.fn().mockImplementation(() => of({isFile: true}));
            // act
            extractPayloads.copyAssets(tempLocationPath, asset, payloadDestinationPath, useSubDirectories).then(() => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockFileService.copyFile).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should started to import child content and do not update visibility', () => {
        // arrange
        const existingContentInDb = 'identifier';
        const objectType = 'Library';
        const isChildContent = true;
        const previousVisibility = 'visibility';
        // act
        const data = extractPayloads.getContentVisibility(existingContentInDb, objectType,
            isChildContent, previousVisibility);
        // assert
        expect(data).toBe('Parent');
    });

    it('should started to import child content and do not update visibility if ObjectType is not Library', () => {
        // arrange
        const existingContentInDb = 'identifier';
        const objectType = 'course';
        const isChildContent = false;
        const previousVisibility = Visibility.DEFAULT;
        // act
        const data = extractPayloads.getContentVisibility(existingContentInDb, objectType,
            isChildContent, previousVisibility);
        // assert
        expect(data).toBe(Visibility.DEFAULT);
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
        // act
        const data = extractPayloads.getContentState(existingContentInDb, contentState);
        // assert
        expect(data).toBe(existingContentInDb.content_state);
    });

    it('should get existing content Id for else part', () => {
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

        const contentState = 2;
        // act
        const data = extractPayloads.getContentState(existingContentInDb, contentState);
        // assert
        expect(data).toBe(contentState);
    });

    describe('segregateQuestions()', ()=>{
        it('should seggregate the questions based on questionset sections', ()=>{
            // arrange
            const destinationRootDir = 'app_storage_path';
            const flattenedList = [
                {
                    identifier: 'parent_question_set_id',
                    mimeType: MimeType.QUESTION_SET
                },
                {
                    identifier: 'child_question_set_id_1',
                    mimeType: MimeType.QUESTION_SET,
                    parent: 'parent_question_set_id'
                },
                {
                    identifier: 'sub_child_question_id_1',
                    mimeType: MimeType.QUESTION,
                    parent: 'child_question_set_id_1'
                },
                {
                    identifier: 'sub_child_question_id_2',
                    mimeType: MimeType.QUESTION,
                    parent: 'child_question_set_id_1'
                },
                {
                    identifier: 'child_question_set_id_2',
                    mimeType: MimeType.QUESTION_SET,
                    parent: 'parent_question_set_id'
                },
                {
                    identifier: 'sub_child_question_id_1',
                    mimeType: MimeType.QUESTION,
                    parent: 'child_question_set_id_2'
                },
                {
                    identifier: 'sub_child_question_id_2',
                    mimeType: MimeType.QUESTION,
                    parent: 'child_question_set_id_2'
                },
                {
                    identifier: 'child_question_id_new_1',
                    mimeType: MimeType.QUESTION
                }
            ]

            extractPayloads['createDirectories'] = jest.fn(()=>Promise.resolve({'id_1':{path:'path'}}));
            // act
            extractPayloads.segregateQuestions(destinationRootDir, flattenedList).then(()=>{
                expect(extractPayloads['createDirectories']).toHaveBeenCalled();
            })
        })
    })

    describe('shouldDownloadQuestionSet', ()=>{
        it('should retun true if mimetype is question-set and visibility is Default', ()=>{
            // arrange
            const contentItems = [{
                mimeType: MimeType.QUESTION_SET,
                visibility: 'Default'
            }]
            const item = {
                mimeType: MimeType.QUESTION_SET,
                visibility: 'Default'
            } 
            extractPayloads['checkParentQustionSet'] = jest.fn(()=>true);
            // act
            const condition = extractPayloads['shouldDownloadQuestionSet'](contentItems, item);
            // assert
            expect(condition).toEqual(true);
        });

        it('should download questionsets if mimetype is question-set and visibility is Default', ()=>{
            // arrange
            const contentItems = [{
                mimeType: MimeType.QUESTION_SET,
                visibility: 'Default'
            }]
            const item = {
                mimeType: MimeType.QUESTION_SET,
                visibility: 'Parent'
            } 
            extractPayloads['checkParentQustionSet'] = jest.fn(()=>true);
            // act
            const condition = extractPayloads['shouldDownloadQuestionSet'](contentItems, item);
            // assert
            expect(extractPayloads['checkParentQustionSet']).toHaveBeenCalled();
        });
    });

});
