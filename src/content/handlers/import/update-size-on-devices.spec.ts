import {UpdateSizeOnDevice} from './update-size-on-device';
import { DbService } from '../../../db';
import { SharedPreferences } from '../../../util/shared-preferences';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../db/schema';
import { of } from 'rxjs';

describe('UpdateSizeOnDevice', () => {
    let updateSizeOnDevice: UpdateSizeOnDevice;
    const mockDbService: Partial<DbService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        updateSizeOnDevice = new UpdateSizeOnDevice(
            mockDbService as DbService,
            mockSharedPreferences as SharedPreferences,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create an instance of UpdateSizeOnDevice', () => {
        expect(updateSizeOnDevice).toBeTruthy();
    });

    it('should be update all root content', () => {
        // arrange
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            visibility: 'Default'
        }];
        (mockDbService.execute as jest.Mock).mockReturnValue(of(rootContentsInDb));
        // act
        updateSizeOnDevice.execute().then(() => {
           // expect(mockDbService.execute).toHaveBeenCalled();
        });
        // assert
    });

    it('should be update all root content', () => {
        // arrange
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
        }];
        (mockDbService.execute as jest.Mock).mockReturnValue(of(rootContentsInDb));
        // act
        updateSizeOnDevice.execute().then(() => {
           // expect(mockDbService.execute).toHaveBeenCalled();
        });
        // assert
    });
});
