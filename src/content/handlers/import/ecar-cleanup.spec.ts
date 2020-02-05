import { EcarCleanup } from './ecar-cleanup';
import { FileService } from '../../../util/file/def/file-service';
import { ContentImportResponse, ImportContentContext, ContentImportStatus } from '../..';
import { of } from 'rxjs';

describe('EcarCleanup', () => {
    let ecarCleanup: EcarCleanup;
    const mockFileService: Partial<FileService> = {
        removeRecursively: jest.fn().mockImplementation(() => {})
    };

    beforeAll(() => {
        ecarCleanup = new EcarCleanup(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of EcarCleanup', () => {
        expect(ecarCleanup).toBeTruthy();
    });

    it('should remove a file recursivly', (done) => {
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
        (mockFileService.removeRecursively as jest.Mock).mockResolvedValue(of([]));
        // act
        ecarCleanup.execute(request).then(() => {
            done();
        });
        // assert
    });

    it('should remove a file recursivly for Error case', (done) => {
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
        (mockFileService.removeRecursively as jest.Mock).mockRejectedValue(of([]));
        // act
        ecarCleanup.execute(request).catch(() => {
            done();
        });
        // assert
    });
});
