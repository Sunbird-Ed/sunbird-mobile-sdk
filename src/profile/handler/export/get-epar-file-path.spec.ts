import {GetEparFilePath} from './get-epar-file-path';
import { FileService } from '../../../util/file/def/file-service';
import { ExportProfileContext } from '../../def/export-profile-context';

describe('GetEparFilePath', () => {
    let getEparFilePath: GetEparFilePath;
    const mockFileService: Partial<FileService> = {};
    Date.now = jest.fn().mockImplementation(() => 1487076708000);

    beforeAll(() => {
        getEparFilePath = new GetEparFilePath(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GetEparFilePath', () => {
        expect(getEparFilePath).toBeTruthy();
    });

    it('should create a directory and a file', (done) => {
        // arrange
        const request: ExportProfileContext = {
            userIds: ['sample-user-id', 'sample-user-id'],
            groupIds: ['group-1', 'group-2'],
            destinationFolder: 'dest/folder/file',
            destinationDBFilePath: 'dest/db/file/path',
            size: '32MB'
        };
        mockFileService.createDir = jest.fn().mockImplementation(() => Promise.resolve({}));
        mockFileService.createFile = jest.fn().mockImplementation(() => Promise.resolve({}));
        // act
        getEparFilePath.execute(request).then(() => {
            // assert
            expect(mockFileService.createDir).toHaveBeenCalled();
            done();
        });
    });
});
