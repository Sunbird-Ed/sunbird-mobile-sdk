import { ChildContentsHandler } from './get-child-contents-handler';
import { DbService } from '../../db';
import { GetContentDetailsHandler } from './get-content-details-handler';
import { ContentEntry } from '../db/schema';
import { ContentMapper } from '../util/content-mapper';
import { Observable } from 'rxjs';
import { HierarchyInfo } from '../def/content';

describe('ChildContentsHandler', () => {
    let childContentHandler: ChildContentsHandler;
    const mockDbService: Partial<DbService> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {};

    beforeAll(() => {
        childContentHandler = new ChildContentsHandler(
            mockDbService as DbService,
            mockGetContentDetailsHandler as GetContentDetailsHandler
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
        ContentMapper.mapContentDBEntryToContent = jest.fn(() => Observable.of([]));
        const data = JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        mockDbService.execute = jest.fn(() => Observable.of([]));
        // act
        await childContentHandler.fetchChildrenOfContent(request, currentLevel, level).then(() => {
            // assert
            expect(ContentMapper.mapContentDBEntryToContent).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(data.children[0].DOWNLOAD).toEqual(1);
            done();
        });
    });

    // it('should not be fetch content', async(done) => {
    //     // arrange
    //     const request: ContentEntry.SchemaMap = {
    //         identifier: 'IDENTIFIER',
    //         server_data: 'SERVER_DATA',
    //         local_data: '{"children": [{"ALL": 0}, "do_234", "do_345"]}',
    //         mime_type: 'MIME_TYPE',
    //         manifest_version: 'MAINFEST_VERSION',
    //         content_type: 'CONTENT_TYPE'
    //     };
    //     const currentLevel = -1;
    //     const level = 2;
    //     ContentMapper.mapContentDBEntryToContent = jest.fn(() => Observable.of([]));
    //     mockDbService.execute = jest.fn(() => Observable.of([]));
    //     const data = JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
    //     console.log(data.children[0].ALL);
    //     // JSON.parse = jest.fn().mockImplementationOnce(() => {
    //     //     return request[ContentEntry.COLUMN_NAME_LOCAL_DATA];
    //     // });
    //     // act
    //     await childContentHandler.fetchChildrenOfContent(request, currentLevel, level).then(() => {
    //       //  expect(JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA])).toHaveBeenCalled();
    //       expect(data.children[0].ALL).toEqual(0);
    //      done();
    //     });
    //     // assert
    // });

    it('should parent child relation', () => {
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
        mockGetContentDetailsHandler.fetchFromDB = jest.fn(() => Observable.of([]));
        // act
        await childContentHandler.getContentFromDB(request, identifier).then(() => {
            done();
        });
        // assert
    });

    it('should fetch next content', () => {
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
    });

    it('should fetch previous content', () => {
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
    });
});
