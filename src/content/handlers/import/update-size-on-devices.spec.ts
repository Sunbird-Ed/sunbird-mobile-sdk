import {UpdateSizeOnDevice} from './update-size-on-device';
import { DbService } from '../../../db';
import { SharedPreferences } from '../../../util/shared-preferences';
import { FileService } from '../../../util/file/def/file-service';
import { ContentEntry } from '../../db/schema';
import { of } from 'rxjs';
import { ContentKeys } from '../../../preference-keys';

declare const sbutility;

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

    it('should be update all root content for getMetadata success part', (done) => {
        // arrange
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 4,
            visibility: 'Default',
            path: 'sample-path',
            size_on_device: 16,
            primary_category: 'textbook'
        }];
        (mockDbService.execute as jest.Mock).mockReturnValue(of(rootContentsInDb));
        mockSharedPreferences.putBoolean = jest.fn(() => of(true));
        mockDbService.beginTransaction = jest.fn();
        mockDbService.update = jest.fn(() => of(1));
        mockDbService.endTransaction = jest.fn();
        sbutility.getMetaData = jest.fn((_, cb, err) => cb({}));
        // act
        updateSizeOnDevice.execute().then(() => {
            // assert
           expect(mockDbService.execute).toHaveBeenCalled();
           expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, false);
           expect(mockDbService.beginTransaction).toHaveBeenCalled();
           expect(mockDbService.update).toHaveBeenCalled();
           expect(mockDbService.endTransaction).toHaveBeenCalled();
           expect(sbutility.getMetaData).toHaveBeenCalled();
           done();
        });
    });

    it('should be update all root content for getMetadata error part', (done) => {
        // arrange
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"artifactUrl": "http:///do_123"}',
            mime_type: 'application/vnd.ekstep.content-collection',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            visibility: 'Default',
            path: 'sample-path',
            primary_category: 'textbook'
        }];
        (mockDbService.execute as jest.Mock).mockReturnValue(of(rootContentsInDb));
        mockSharedPreferences.putBoolean = jest.fn(() => of(true));
        sbutility.getMetaData = jest.fn((_, cb, err) => err({error: 'sample-error'}));
        // act
        updateSizeOnDevice.execute().then(() => {
            // assert
           expect(mockDbService.execute).toHaveBeenCalled();
           expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, false);
           done();
        }, e => {
            done();
        });
    });

    it('should be update all root content', (done) => {
        // arrange
        mockDbService.execute = jest.fn().mockImplementation(() => {});
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            visibility: 'auto',
            primary_category: 'textbook'
        }];
        (mockDbService.execute as jest.Mock).mockReturnValue(of(rootContentsInDb));
        mockSharedPreferences.putBoolean = jest.fn(() => of(true));
        mockDbService.beginTransaction = jest.fn();
        mockDbService.update = jest.fn(() => of(1));
        mockDbService.endTransaction = jest.fn();
        // act
        updateSizeOnDevice.execute().then(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, false);
            expect(mockDbService.beginTransaction).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
            expect(mockDbService.endTransaction).toHaveBeenCalled();
            done();
        });
    });
});
