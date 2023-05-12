import {CreateTempLoc} from './create-temp-loc';
import {FileService} from '../../../util/file/def/file-service';
import {ContentEntry} from '../../db/schema';
import {ExportContentContext} from '../..';
import { UniqueId } from '../../../db/util/unique-id';

describe('CreateTempLoc', () => {
    let createTempLoc: CreateTempLoc;
    const mockFileService: Partial<FileService> = {
        createDir: jest.fn().mockImplementation(() => {
        })
    };
    jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
    beforeAll(() => {
        createTempLoc = new CreateTempLoc(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of CreateTempLoc', () => {
        expect(createTempLoc).toBeTruthy();
    });

    it('should create a directory', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        (mockFileService.createDir as jest.Mock).mockResolvedValue('SAMPLE_TEMP_PATHuuui4d');
        jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
        // act
        createTempLoc.execute(request).then(() => {

        });
        // assert
    });

    it('should create a directory for catch part', () => {
        // arrange
        const contentEntrySchema: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            tmpLocationPath: 'SAMPLE_TEMP_PATH',
            contentModelsToExport: contentEntrySchema,
            items: ['artifactUrl'],
            metadata: {'SAMPLE_KEY': 'SAMPLE_META_DATA'},

        };
        (mockFileService.createDir as jest.Mock).mockRejectedValue([]);
        jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
        // act
        createTempLoc.execute(request).catch(() => {

        });
        // assert
    });
});
