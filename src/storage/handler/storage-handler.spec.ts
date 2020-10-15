import { StorageHandler } from './storage-handler';
import { AppConfig } from '../../api/config/app-config';
import { FileService } from '../../util/file/def/file-service';
import { DbService, DeviceInfo } from '../..';
import { MimeType, Visibility } from '../../content';
import { of } from 'rxjs';

describe('StorageHandler', () => {
    let storageHandler: StorageHandler;
    const mockAppConfig: Partial<AppConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};

    beforeAll(() => {
        storageHandler = new StorageHandler(
            mockAppConfig as AppConfig,
            mockFileService as FileService,
            mockDbService as DbService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of StorageHandler', () => {
        expect(storageHandler).toBeTruthy();
    });

    describe('addDestinationContentInDb', () => {
        it('should extract a content from item if package version is updated', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockFileService.readAsText = jest.fn(() => Promise.resolve(JSON.stringify({
                ver: '1.0',
                archive: {
                    items: [{
                        identifier: 'do-123',
                        mimeType: 'sample-mimeType',
                        contentType: 'sample-type',
                        primaryCategory: 'sample-type',
                        visibility: 'default',
                        audience: 'sample-audience',
                        pragma: ['sample', 'pragma'],
                        compatibilityLevel: 3,
                        pkgVersion: 6,
                        board: ['cbsc'],
                        medium: ['en'],
                        grade: ['class 1']
                    }]
                }
            })));
            mockDbService.read = jest.fn(() => of([{
                identifier: 'do-123',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"],"pkgVersion": 4, "artifactUrl": "http:///do_123"}',
                mime_type: 'application/vnd.ekstep.content-collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: Visibility.DEFAULT.valueOf()
            }]));
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(1));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                setTimeout(() => {
                    expect(mockFileService.readAsText).toHaveBeenCalled();
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockDbService.insert).toHaveBeenCalled();
                    expect(mockDbService.beginTransaction).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    expect(mockDbService.endTransaction).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should extract a content from item if package version is updated and visibilty is not default', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockFileService.readAsText = jest.fn(() => Promise.resolve(JSON.stringify({
                ver: '1.0',
                archive: {
                    items: [{
                        identifier: 'do-123',
                        mimeType: 'sample-mimeType',
                        contentType: 'sample-type',
                        primaryCategory: 'sample-type',
                        visibility: 'default',
                        audience: 'sample-audience',
                        pragma: ['sample', 'pragma'],
                        compatibilityLevel: 3,
                        pkgVersion: 6,
                        board: ['cbsc'],
                        medium: ['en'],
                        grade: ['class 1']
                    }]
                }
            })));
            mockDbService.read = jest.fn(() => of([{
                identifier: 'do-123',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"],"pkgVersion": 4, "artifactUrl": "http:///do_123"}',
                mime_type: 'application/vnd.ekstep.content-collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: Visibility.PARENT.valueOf()
            }]));
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(1));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                setTimeout(() => {
                    expect(mockFileService.readAsText).toHaveBeenCalled();
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockDbService.insert).toHaveBeenCalled();
                    expect(mockDbService.beginTransaction).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    expect(mockDbService.endTransaction).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should extract a content from item if package version is not updated', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockAppConfig.minCompatibilityLevel = 1;
            mockAppConfig.maxCompatibilityLevel = 1;
            mockFileService.readAsText = jest.fn().mockImplementation(() => { });
            mockFileService.readAsText = jest.fn(() => Promise.resolve(JSON.stringify({
                ver: '1.0',
                archive: {
                    items: [{
                        identifier: 'do-123',
                        mimeType: MimeType.COLLECTION.valueOf(),
                        contentType: 'sample-type',
                        primaryCategory: 'sample-type',
                        visibility: 'default',
                        audience: 'sample-audience',
                        pragma: ['sample', 'pragma'],
                        compatibilityLevel: 1,
                        pkgVersion: 3,
                        board: ['cbsc'],
                        medium: ['en'],
                        grade: ['class 1']
                    }]
                }
            })));
            mockDbService.read = jest.fn(() => of([{
                identifier: 'do-123',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"],"pkgVersion": 4, "artifactUrl": "http:///do_123"}',
                mime_type: 'application/vnd.ekstep.content-collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: 'Default'
            }]));
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(1));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                setTimeout(() => {
                    expect(mockFileService.readAsText).toHaveBeenCalled();
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockDbService.insert).toHaveBeenCalled();
                    expect(mockDbService.beginTransaction).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    expect(mockDbService.endTransaction).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should extract a content from item if package version is not updated and mimtype is not collection', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockAppConfig.minCompatibilityLevel = 1;
            mockAppConfig.maxCompatibilityLevel = 1;
            mockFileService.readAsText = jest.fn().mockImplementation(() => { });
            mockFileService.readAsText = jest.fn(() => Promise.resolve(JSON.stringify({
                ver: '1.0',
                archive: {
                    items: [{
                        identifier: 'do-123',
                        mimeType: MimeType.ECAR.valueOf(),
                        contentType: 'sample-type',
                        primaryCategory: 'sample-type',
                        visibility: 'default',
                        audience: 'sample-audience',
                        pragma: ['sample', 'pragma'],
                        compatibilityLevel: 1,
                        pkgVersion: 3,
                        board: ['cbsc'],
                        medium: ['en'],
                        grade: ['class 1']
                    }]
                }
            })));
            mockDbService.read = jest.fn(() => of([{
                identifier: 'do-123',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"],"pkgVersion": 4, "artifactUrl": "http:///do_123"}',
                mime_type: 'application/vnd.ekstep.content-collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: 'Default'
            }]));
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(1));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                setTimeout(() => {
                    expect(mockFileService.readAsText).toHaveBeenCalled();
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockDbService.insert).toHaveBeenCalled();
                    expect(mockDbService.beginTransaction).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    expect(mockDbService.endTransaction).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should extract a content from item if existingContentModel is undefined', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockAppConfig.minCompatibilityLevel = 1;
            mockAppConfig.maxCompatibilityLevel = 1;
            mockFileService.readAsText = jest.fn(() => Promise.resolve(JSON.stringify({
                ver: '1.0',
                archive: {
                    items: [{
                        identifier: 'do-123',
                        mimeType: MimeType.ECAR.valueOf(),
                        contentType: 'sample-type',
                        primaryCategory: 'sample-type',
                        visibility: 'default',
                        audience: 'sample-audience',
                        pragma: ['sample', 'pragma'],
                        compatibilityLevel: 1,
                        pkgVersion: 3,
                        board: ['cbsc'],
                        medium: ['en'],
                        grade: ['class 1']
                    }]
                }
            })));
            mockDbService.read = jest.fn(() => of([]));
            mockFileService.getDirectorySize = jest.fn(() => Promise.resolve(1));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            mockDbService.insert = jest.fn(() => of(1));
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                setTimeout(() => {
                    expect(mockFileService.readAsText).toHaveBeenCalled();
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockFileService.getDirectorySize).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockDbService.insert).toHaveBeenCalled();
                    expect(mockDbService.beginTransaction).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    expect(mockDbService.endTransaction).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should not extract a content for catch part', (done) => {
            // arrange
            const identifier = 'SAMPLE_IDENTIFIER';
            const storageFolder = 'STORAGE_FOLDER_PATH';
            const keepLowerVersion = true;
            mockAppConfig.minCompatibilityLevel = 1;
            mockAppConfig.maxCompatibilityLevel = 1;
            mockFileService.readAsText = jest.fn(() => Promise.reject({ error: 'error' }));
            // act
            storageHandler.addDestinationContentInDb(identifier, storageFolder, keepLowerVersion).then(() => {
                // assert
                expect(mockFileService.readAsText).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('deleteContentsFromDb', () => {
        it('should delete a content from DB if contentType is only spine and mimeType is not collection', (done) => {
            // arrange
            const deletedIdentifiers = ['SAMPALE_1', 'SAMPLE_2'];
            mockDbService.execute = jest.fn(() => of([{
                identifier: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: MimeType.ECAR.valueOf(),
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: Visibility.PARENT,
                ref_count: 2
            }]));
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.deleteContentsFromDb(deletedIdentifiers).then(() => {
                // assert
                expect(mockDbService.beginTransaction).toHaveBeenCalled();
                expect(mockDbService.update).toHaveBeenCalled();
                expect(mockDbService.endTransaction).toHaveBeenCalled();
                done();
            });
        });

        it('should delete a content from DB if mimetype is collection', (done) => {
            // arrange
            const deletedIdentifiers = ['SAMPALE_1', 'SAMPLE_2'];
            mockDbService.execute = jest.fn(() => of([{
                identifier: 'IDENTIFIER',
                server_data: 'SERVER_DATA',
                local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
                mime_type: 'application/vnd.ekstep.content-collection',
                manifest_version: 'MAINFEST_VERSION',
                content_type: 'CONTENT_TYPE',
                content_state: 2,
                visibility: Visibility.DEFAULT,
                ref_count: 2
            }]));
            mockDbService.beginTransaction = jest.fn();
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.endTransaction = jest.fn();
            // act
            storageHandler.deleteContentsFromDb(deletedIdentifiers).then(() => {
                // assert
                expect(mockDbService.beginTransaction).toHaveBeenCalled();
                expect(mockDbService.update).toHaveBeenCalled();
                expect(mockDbService.endTransaction).toHaveBeenCalled();
                done();
            });
        });
    });
});
