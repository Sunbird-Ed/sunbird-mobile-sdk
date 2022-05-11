import { GetModifiedContentHandler } from './get-modified-content-handler';
import { FileService } from '../../../util/file/def/file-service';
import { DbService } from '../../..';
import { ScanContentContext } from '../../def/scan-requests';
import { of } from 'rxjs';

describe('GetModifiedContentHandler', () => {
    let getModifiedContentHandler: GetModifiedContentHandler;
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
       
        getModifiedContentHandler = new GetModifiedContentHandler(
            mockFileService as FileService,
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        window['device'] = { uuid: 'some_uuid', platform:'android' };
        jest.clearAllMocks();
    });

    it('should be create a instance of GetModifiedContentHandler', () => {
        expect(getModifiedContentHandler).toBeTruthy();
    });

    it('should scan newly added content in storage', (done) => {
        // arrange
        const request: ScanContentContext = {
            currentStoragePath: 'SAMPLE_CURRENT_STORAGE_PATH'
        };
        mockDbService.execute = jest.fn().mockImplementation(() => { });
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }]));
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
        // act
        getModifiedContentHandler.execute(request).subscribe(() => {
            // assert
            done();
        });
    });

    it('should scan newly added content in storage for error list directory', (done) => {
        // arrange
        const request: ScanContentContext = {
            currentStoragePath: 'SAMPLE_CURRENT_STORAGE_PATH'
        };
        mockDbService.execute = jest.fn().mockImplementation(() => { });
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }]));
        mockFileService.listDir = jest.fn().mockImplementation(() => { });
        (mockFileService.listDir as jest.Mock).mockRejectedValue(([
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
        // act
        getModifiedContentHandler.execute(request).subscribe(() => {
            // assert
            done();
        });
    });

    it('should added new identifier when currentstoragePath is undefind', (done) => {
        // arrange
        const request: ScanContentContext = {
            currentStoragePath: ''
        };
        mockDbService.execute = jest.fn().mockImplementation(() => { });
        (mockDbService.execute as jest.Mock).mockReturnValue(of([{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }]));
        mockFileService.listDir = jest.fn().mockImplementation(() => { });
        (mockFileService.listDir as jest.Mock).mockRejectedValue(([
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
        // act
        getModifiedContentHandler.execute(request).subscribe(() => {
            // assert
            done();
        });
    });
});
