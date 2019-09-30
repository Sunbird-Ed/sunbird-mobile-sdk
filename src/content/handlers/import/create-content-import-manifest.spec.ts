import {CreateContentImportManifest} from './create-content-import-manifest';
import { DbService } from '../../../db';
import { DeviceInfo } from '../../../util/device';
import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext, ContentImportResponse, ContentImportStatus } from '../..';
import { Observable } from 'rxjs';

describe('CreateContentImportManifest', () => {
    let createContentImportManifest: CreateContentImportManifest;
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFileService: Partial<FileService> = {
        readAsText: jest.fn(() => {})
    };

    beforeAll(() => {
        createContentImportManifest = new CreateContentImportManifest(
         mockDbService as DbService,
         mockDeviceInfo as DeviceInfo,
         mockFileService as FileService
        );
    });

    it('should be create a instance of createContentImportManifest', () => {
        expect(createContentImportManifest).toBeTruthy();
    });

    it('', async(done) => {
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
            contentIdsToDelete: new Set(['1', '2'])
        };
        const data = (mockFileService.readAsText as jest.Mock).mockReturnValue(Observable.of([{'archive': {
            'items': 'SAMPLE_ITEMS'
        }}]));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data.ar;
        });
        // act
        createContentImportManifest.execute(request).then(() => {
          done();
        });
        // assert
    });
});
