import { CopyDatabase } from './copy-database';
import { DbService } from '../../..';
import { ExportProfileContext } from '../../def/export-profile-context';
import { of } from 'rxjs';

describe('CopyDatabase', () => {
    let copyDatabase: CopyDatabase;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        copyDatabase = new CopyDatabase(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of CopyDatabase', () => {
        expect(copyDatabase).toBeTruthy();
    });

    it('should copy file from destination file path', () => {
        // arrange
        const request: ExportProfileContext = {
            userIds: ['sample-user-id'],
            groupIds: ['group-1', 'group-2'],
            destinationFolder: 'dest/folder/file',
            destinationDBFilePath: 'dest/db/file/path',
            size: '32MB'
        };
        mockDbService.copyDatabase = jest.fn().mockImplementation(() => of({}));
        // act
        copyDatabase.execute(request);
        // assert
        expect(mockDbService.copyDatabase).toHaveBeenCalled();
    });
});
