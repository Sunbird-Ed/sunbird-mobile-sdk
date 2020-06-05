import { ExtractEcar } from './extract-ecar';
import { FileService } from '../../../util/file/def/file-service';
import { ZipService } from '../../../util/zip/def/zip-service';
import { ContentImportResponse, ContentImportStatus, ImportContentContext } from '../..';
import { Observable } from 'rxjs';

describe('ExtractEcar', () => {
    let extractEcar: ExtractEcar;
    const mockFileService: Partial<FileService> = {
        createDir: jest.fn().mockImplementation(() => {})
    };
    const mockZipService: Partial<ZipService> = {};

    beforeAll(() => {
        extractEcar = new ExtractEcar(
          mockFileService as FileService,
          mockZipService as ZipService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ExtractEcar', () => {
        expect(extractEcar).toBeTruthy();
    });

    it('should create a directory and zip file convert to unzip file for Error part', (done) => {
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
            metadata: {FILE_SIZE: 1}
        };
        const metaData = {
            modificationTime: '20/03/2020',
            size: 1
        };
        mockFileService.getMetaData = jest.fn(() => Promise.resolve(metaData)) as any;
        // act
        extractEcar.execute(request).catch((e) => {
            // assert
            expect(e._errorMesg).toBe('IMPORT_FAILED_EXTRACTION');
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            done();
        });
    });

    it('should create a directory and zip file convert to unzip file', (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            metadata: {FILE_SIZE: 1}
        };
        mockFileService.getMetaData = jest.fn().mockImplementation(() => {});
    (mockFileService.getMetaData as jest.Mock).mockResolvedValue({modificationTime: 'July 20, 69 00:20:18', size: 16});
        (mockFileService.createDir as jest.Mock).mockResolvedValue({nativeURL: 'sample-native-url'});
        mockZipService.unzip = jest.fn((_, __, cd, err) => cd());
        // act
        extractEcar.execute(request).catch(() => {
            done();
        }).then(() => {
             // assert
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            expect(mockFileService.createDir).toHaveBeenCalled();
            expect(mockZipService.unzip).toHaveBeenCalled();
            done();
        });
    });

    it('should create a directory and zip file convert to unzip file for zip error case', (done) => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            metadata: {FILE_SIZE: 1}
        };
        mockFileService.getMetaData = jest.fn().mockImplementation(() => {});
    (mockFileService.getMetaData as jest.Mock).mockResolvedValue({modificationTime: 'July 20, 69 00:20:18', size: 16});
        (mockFileService.createDir as jest.Mock).mockResolvedValue({nativeURL: 'sample-native-url'});
        mockZipService.unzip = jest.fn((_, __, cd, err) => err());
        // act
        extractEcar.execute(request).catch(() => {
            done();
        }).then(() => {
             // assert
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            expect(mockFileService.createDir).toHaveBeenCalled();
            expect(mockZipService.unzip).toHaveBeenCalled();
            done();
        });
    });
});
