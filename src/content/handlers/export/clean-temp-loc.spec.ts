import {CleanTempLoc} from './clean-temp-loc';
import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {ContentEntry} from '../../db/schema';
import {of} from 'rxjs';
import {FileUtil} from '../../../util/file/util/file-util';

jest.mock('../../../util/file/util/file-util');
declare const diretory;

describe('CleanTempLoc', () => {
    let cleanTempLoc: CleanTempLoc;
    const mockFileService: Partial<FileService> = {
        listDir: jest.fn().mockImplementation(() => {
        }),
        getMetaData: jest.fn().mockImplementation(() => {
        })
    };
    const mockFileUtil: FileUtil = {
        getFileExtension: jest.fn().mockImplementation(() => {
        }),
    };

    beforeAll(() => {
        cleanTempLoc = new CleanTempLoc(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of cleanTempLoc', () => {
        expect(cleanTempLoc).toBeTruthy();
    });

    it('should exportEcar and clean temporary location', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            primary_category: 'textbook'
        }];
        const exportContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: {['SAMPLE_KEY']: 'META_DATA'},
        };
        mockFileService.listDir = jest.fn(() => Promise.resolve([{
            nativeURL: 'sample.ecar',
            remove: jest.fn((cb, err) => cb())
        }])) as any;
        jest.spyOn(FileUtil, 'getFileExtension').mockImplementation(() => {
            return 'ecar';
        });
        mockFileService.getMetaData = jest.fn(() => Promise.resolve({
            modificationTime: new Date(2020, 7, 7)
        })) as any;
        // act
        await cleanTempLoc.execute(exportContext).then((d) => {
            // assert
            expect(d.body).toBeTruthy();
            expect(mockFileService.listDir).toHaveBeenCalled();
            expect(FileUtil.getFileExtension).toReturn();
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            done();
        });
    });

    it('should exportEcar and clean temporary location for error part', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            primary_category: 'textbook'
        }];
        const exportContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: {['SAMPLE_KEY']: 'META_DATA'},
        };
        mockFileService.listDir = jest.fn(() => Promise.resolve([{
            nativeURL: 'sample.ecar',
            remove: jest.fn((cb, err) => err({error: 'error'}))
        }])) as any;
        jest.spyOn(FileUtil, 'getFileExtension').mockImplementation(() => {
            return 'ecar';
        });
        mockFileService.getMetaData = jest.fn(() => Promise.resolve({
            modificationTime: new Date(2020, 7, 7)
        })) as any;
        await cleanTempLoc.execute(exportContext).then((e) => {
            // assert
            expect(e.body).toBeTruthy();
            expect(mockFileService.listDir).toHaveBeenCalled();
            expect(FileUtil.getFileExtension).toReturn();
            expect(mockFileService.getMetaData).toHaveBeenCalled();
            done();
        });
    });

    it('should exportEcar and clean temporary location if file extention is not matched', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            primary_category: 'textbook'
        }];
        const exportContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: {['SAMPLE_KEY']: 'META_DATA'},
        };
        mockFileService.listDir = jest.fn(() => Promise.resolve([{
            nativeURL: 'sample.pdf',
            remove: jest.fn((cb, err) => err({error: 'error'}))
        }])) as any;
        jest.spyOn(FileUtil, 'getFileExtension').mockImplementation(() => {
            return 'pdf';
        });
        await cleanTempLoc.execute(exportContext).then((e) => {
            // assert
            expect(e.body).toBeTruthy();
            expect(mockFileService.listDir).toHaveBeenCalled();
            expect(FileUtil.getFileExtension).toReturn();
            done();
        });
    });

    it('should exportEcar and clean temporary location if directoryList is empty', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            primary_category: 'textbook'
        }];
        const exportContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: {['SAMPLE_KEY']: 'META_DATA'},
        };
        mockFileService.listDir = jest.fn(() => Promise.resolve([])) as any;
        await cleanTempLoc.execute(exportContext).then((e) => {
            // assert
            expect(e.body).toBeTruthy();
            expect(mockFileService.listDir).toHaveBeenCalled();
            done();
        });
    });
});
