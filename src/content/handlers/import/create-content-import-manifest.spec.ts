import { CreateContentImportManifest } from './create-content-import-manifest';
import { DbService } from '../../../db';
import { DeviceInfo } from '../../../util/device';
import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext, ContentImportResponse, ContentImportStatus } from '../..';
import { ContentUtil } from '../../util/content-util';
import { ContentEntry } from '../../db/schema';

declare const sbutility;

describe('CreateContentImportManifest', () => {
    let createContentImportManifest: CreateContentImportManifest;
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFileService: Partial<FileService> = {
        // readAsText: jest.fn().mockImplementation(() => { })
    };

    beforeAll(() => {
        createContentImportManifest = new CreateContentImportManifest(
            mockDbService as DbService,
            mockDeviceInfo as DeviceInfo,
            mockFileService as FileService
        );
    });
    beforeEach(() => {
        window['device'] = { uuid: 'some_uuid', platform:'android' };
    });

    it('should be create a instance of createContentImportManifest', () => {
        expect(createContentImportManifest).toBeTruthy();
    });

    it('should read a text', (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            identifiers: ['sample-id']
        };
        mockFileService.readAsText = jest.fn(() =>
                Promise.resolve('{"ver": "1.0", "archive": {"items": [{"status": "pass", "children": [{"identifier": "id"}], "identifier": "sample-id"}]}}')
        );
        jest.spyOn(ContentUtil, 'hasChildren').mockReturnValue(true);
        mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device');
        sbutility.writeFile = jest.fn().mockImplementation((_, cb) => { cb(); });
        // act
        createContentImportManifest.execute(request).then(() => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(sbutility.writeFile).toHaveBeenCalled();
            done();
        });
    });

    it('should read a text handle error part', (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            identifiers: ['sample-id']
        };
        mockFileService.readAsText = jest.fn(() =>
                Promise.resolve('{"ver": "1.0", "archive": {"items": [{"status": "pass", "children": [], "identifier": "sample-id"}]}}')
        );
        jest.spyOn(ContentUtil, 'hasChildren').mockReturnValue(true);
        mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device');
        sbutility.writeFile = jest.fn().mockImplementation((_, cb, er) => { er(); });
        // act
        createContentImportManifest.execute(request).catch(() => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(sbutility.writeFile).toHaveBeenCalled();
            done();
        });
    });

    it('should read a text if children is undefined', (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            identifiers: ['sample-id']
        };
        mockFileService.readAsText = jest.fn(() =>
                Promise.resolve('{"ver": "1.0", "archive": {"items": [{"status": "pass", "children": [], "identifier": "sample-id"}]}}')
        );
        jest.spyOn(ContentUtil, 'hasChildren').mockReturnValue(false);
        mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device');
        sbutility.writeFile = jest.fn().mockImplementation((_, cb) => { cb(); });
        // act
        createContentImportManifest.execute(request).then(() => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(sbutility.writeFile).toHaveBeenCalled();
            done();
        });
    });
});
