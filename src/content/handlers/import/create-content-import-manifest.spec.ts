import { CreateContentImportManifest } from './create-content-import-manifest';
import { DbService } from '../../../db';
import { DeviceInfo } from '../../../util/device';
import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext, ContentImportResponse, ContentImportStatus } from '../..';

describe('CreateContentImportManifest', () => {
    let createContentImportManifest: CreateContentImportManifest;
    const mockDbService: Partial<DbService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFileService: Partial<FileService> = {
        readAsText: jest.fn(() => { })
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

    it('should read a text', async (done) => {
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
            identifiers: ['SAMPLE_IDENTIFIER']
        };
        const readAsText = (mockFileService.readAsText as jest.Mock)
            .mockResolvedValue('{"ver": "1.0", "archive": {"items": [{"status": "pass"}]}}');
        readAsText().then((value) => {
            return value;
        });
        // act
        await createContentImportManifest.execute(request).catch(() => {
            
            done();
        });
        // assert
    });
});
