import { CleanupExportedFile } from './clean-up-exported-file';
import { DbService, ErrorCode } from '../../..';
import { FileService } from '../../../util/file/def/file-service';
import { ExportProfileContext } from '../../def/export-profile-context';
import { of } from 'rxjs';

describe('CleanupExportedFile', () => {
    let cleanupExportedFile: CleanupExportedFile;
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        cleanupExportedFile = new CleanupExportedFile(
            mockDbService as DbService,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of cleanupExportedFile', () => {
        // arrange
        // act
        // assert
        expect(cleanupExportedFile).toBeTruthy();
    });

    it('should return all table details and remove table', (done) => {
        // arrange
        const request: ExportProfileContext = {
            userIds: ['sample-user-id', 'sample-user-id'],
            groupIds: ['group-1', 'group-2'],
            destinationFolder: 'dest/folder/file',
            destinationDBFilePath: 'dest/db/file/path',
            size: '32MB'
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([{ tableName: 'sample-table', name: 'db' }]));
        mockDbService.read = jest.fn().mockImplementation(() => of([{}]));
        mockDbService.insert = jest.fn().mockImplementation(() => of(2));
        mockFileService.getMetaData = jest.fn().mockImplementation(() => Promise.resolve({ size: 4 }));
        mockFileService.removeFile = jest.fn().mockImplementation(() => Promise.resolve({ success: true }));
        // act
        cleanupExportedFile.execute(request).then(() => {
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            expect(mockFileService.removeFile).toHaveBeenCalled();
            done();
        }).catch((e) => {
            console.error(e);
            fail(e);
        });
    });

    it('should return errorMesg for for failed removeFile', (done) => {
        // arrange
        const request: ExportProfileContext = {
            userIds: [],
            groupIds: [],
            destinationFolder: '',
            destinationDBFilePath: '',
            size: '32MB'
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([{ tableName: 'sample-table', name: 'db' }]));
        mockDbService.read = jest.fn().mockImplementation(() => of([{}]));
        mockDbService.insert = jest.fn().mockImplementation(() => of(2));
        mockFileService.getMetaData = jest.fn().mockImplementation(() => Promise.resolve({ size: 4 }));
        mockFileService.removeFile = jest.fn().mockImplementation(() => Promise.reject({ errorMesg: '' }));
        // act
        cleanupExportedFile.execute(request).catch((e) => {
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            expect(mockFileService.removeFile).toHaveBeenCalled();
            expect(e._errorMesg).toBe(ErrorCode.EXPORT_FAILED);
            done();
        });
    });
});
