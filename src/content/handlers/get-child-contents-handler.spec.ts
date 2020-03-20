import { ChildContentsHandler } from './get-child-contents-handler';
import { DbService } from '../../db';
import { GetContentDetailsHandler } from './get-content-details-handler';
import { ContentEntry } from '../db/schema';
import { ContentMapper } from '../util/content-mapper';
import { of } from 'rxjs';
import { ChildContent, HierarchyInfo } from '..';
import { FileService } from '../../util/file/def/file-service';

describe('ChildContentsHandler', () => {
    let childContentHandler: ChildContentsHandler;
    const mockDbService: Partial<DbService> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        childContentHandler = new ChildContentsHandler(
            mockDbService as DbService,
            mockGetContentDetailsHandler as GetContentDetailsHandler,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be return instance of childContentHandler', () => {
        expect(childContentHandler).toBeTruthy();
    });

    it('should fetch all children if availabe from content', async (done) => {
        // arrange
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        };
        const currentLevel = -1;
        const level = -1;
        const childData: ChildContent = {
            identifier: 'IDENTIFIER',
            name: 'SAMPLE_NAME',
            objectType: '',
            relation: '',
            index: 1
        };
        const childContentsMap = new Map();
        childContentsMap.set('IDENTIFIER', 'd0_id');
        ContentMapper.mapContentDBEntryToContent = jest.fn().mockImplementation(() => ({hierarchyInfo: {data: ''}}));
        const data = JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        // act
        await childContentHandler.fetchChildrenOfContent(request, childContentsMap, currentLevel, level).then(() => {
            // assert
            expect(ContentMapper.mapContentDBEntryToContent).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(data.children[0].DOWNLOAD).toEqual(1);
            done();
        });
    });

    it('should parent child relation', (done) => {
        // arrange
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        };
        const key = 'IDENTIFIER';
        const data = JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        // act
        childContentHandler.getContentsKeyList(request).then(() => {
            expect(key).toEqual('IDENTIFIER');
            done();
        });
        // assert
    });

    it('should fetch content from DB', async (done) => {
        // arrange
        const request: HierarchyInfo[] = [{
            identifier: 'SAMPLE_IDENTIFIER_1',
            contentType: 'SAMPLE_CONTENT_TYPE_1'
        },
        {
            identifier: 'SAMPLE_IDENTIFIER_2',
            contentType: 'SAMPLE_CONTENT_TYPE_2'
        }];
        const identifier = 'IDENTIFIER';
        mockGetContentDetailsHandler.fetchFromDB = jest.fn().mockImplementation(() => of([]));
        // act
        await childContentHandler.getContentFromDB(request, identifier).then(() => {
            done();
        });
        // assert
    });

    it('should fetch next content', (done) => {
        // arrange
        const request: HierarchyInfo[] = [{
            identifier: 'SAMPLE_IDENTIFIER_1',
            contentType: 'SAMPLE_CONTENT_TYPE_1'
        },
        {
            identifier: 'SAMPLE_IDENTIFIER_2',
            contentType: 'SAMPLE_CONTENT_TYPE_2'
        }];
        const currentIdentifier = 'SAMPLE_CURRENT_IDENTIFIER';
        const contentKeyList = ['SAMPLE_IDENTIFIER_1', 'SAMPLE_IDENTIFIER_2',
            'SAMPLE_IDENTIFIER_1/SAMPLE_IDENTIFIER_2/SAMPLE_CURRENT_IDENTIFIER'];
        // act
        childContentHandler.getNextContentIdentifier(request, currentIdentifier, contentKeyList);
        // assert
        done();
    });

    it('should fetch previous content', (done) => {
        // arrange
        const request: HierarchyInfo[] = [{
            identifier: 'SAMPLE_IDENTIFIER_1',
            contentType: 'SAMPLE_CONTENT_TYPE_1'
        },
        {
            identifier: 'SAMPLE_IDENTIFIER_2',
            contentType: 'SAMPLE_CONTENT_TYPE_2'
        }];
        const currentIdentifier = 'SAMPLE_CURRENT_IDENTIFIER';
        const contentKeyList = ['SAMPLE_IDENTIFIER_1', 'SAMPLE_IDENTIFIER_2',
            'SAMPLE_IDENTIFIER_1/SAMPLE_IDENTIFIER_2/SAMPLE_CURRENT_IDENTIFIER'];
        // act
        childContentHandler.getPreviousContentIdentifier(request, currentIdentifier, contentKeyList);
        // assert
        done();
    });

    it('should get ChildIdentifiers From Manifest', (done) => {
        // arrange
        mockFileService.readAsText = jest.fn().mockImplementation(() => {
        });
        const readAsText = (mockFileService.readAsText as jest.Mock)
            .mockResolvedValue(JSON.stringify({ archive: { items: [{ identifier: 'pass' }, { identifier: 'pass-2' }] } }));
        readAsText().then((value) => {
            return value;
        });
        // act
        childContentHandler.getChildIdentifiersFromManifest('textbook_unit_1').then(() => {
            // assert
            expect(mockFileService.readAsText).toHaveBeenCalledWith('file:///textbook_unit_1', 'manifest.json');
            done();
        });
    });

    it('should get ChildIdentifiers From Manifest for catch part', async(done) => {
        // arrange
        mockFileService.readAsText = jest.fn().mockImplementation(() => Promise.reject('textbook'));
        // act
        childContentHandler.getChildIdentifiersFromManifest('textbook_unit_1').then(() => {
             // assert
             expect(mockFileService.readAsText).toHaveBeenCalledWith('file:///textbook_unit_1', 'manifest.json');
            done();
        });
    });
});
