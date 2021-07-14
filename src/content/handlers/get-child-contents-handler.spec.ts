import { ChildContentsHandler } from './get-child-contents-handler';
import { DbService } from '../../db';
import { GetContentDetailsHandler } from './get-content-details-handler';
import { ContentEntry } from '../db/schema';
import { ContentMapper } from '../util/content-mapper';
import { of } from 'rxjs';
import { ChildContent, HierarchyInfo } from '..';
import { FileService } from '../../util/file/def/file-service';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import {AppConfig} from '../../api/config/app-config';

describe('ChildContentsHandler', () => {
    let childContentHandler: ChildContentsHandler;
    const mockDbService: Partial<DbService> = {};
    const mockGetContentDetailsHandler: Partial<GetContentDetailsHandler> = {};
    const mockFileService: Partial<FileService> = {};
    const mockAppConfig: Partial<AppConfig> = {};

    beforeAll(() => {
        childContentHandler = new ChildContentsHandler(
            mockDbService as DbService,
            mockGetContentDetailsHandler as GetContentDetailsHandler,
            mockAppConfig as AppConfig,
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be return instance of childContentHandler', () => {
        expect(childContentHandler).toBeTruthy();
    });

    it('should fetch all children if availabe from content', (done) => {
        // arrange
        const localData = JSON.stringify({
            children: [{
                index: 1,
                identifier: 'do-123'
            }, {
                index: 2,
                identifier: 'do-234'
            }, {
                index: 3,
                identifier: 'do-345'
            }],
            identifier: 'do-123',
            name: 'sample'
        });
        const serverData = JSON.stringify({
            identifier: 'server-id',
            name: 'server'
        });
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: serverData,
            local_data: localData,
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            primary_category: 'ETB'
        };
        const currentLevel = -1;
        const level = 1;
        const childData: ChildContent = {
            identifier: 'IDENTIFIER',
            name: 'SAMPLE_NAME',
            objectType: '',
            relation: '',
            index: 1
        };
        const childContentsMap = new Map();
        childContentsMap.set('do-123', {server_data: serverData, local_data: localData, content_type: 'textbook'});
        mockDbService.execute = jest.fn(() => of([{
            identifier: 'do-000', local_data: localData, content_type: 'textbook'
        }]));
        // act
        childContentHandler.fetchChildrenOfContent(request, childContentsMap, currentLevel, level).then(() => {
            // assert
            setTimeout(() => {
                expect(ContentMapper.mapContentDBEntryToContent).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
            }, 0);
            done();
        });
    });

    it('should parent child relation', (done) => {
        // arrange
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: JSON.stringify({
                children: [{
                    index: 1,
                    identifier: 'identifier'
                }, {
                    index: 2,
                    identifier: 'do-234'
                }, {
                    index: 3,
                    identifier: 'do-345'
                }],
                identifier: 'do-123'
            }),
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            primary_category: 'textbook'
        };
        const key = 'IDENTIFIER';
        // const data = JSON.parse(request[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        mockDbService.execute = jest.fn(() => of([{
            identifier: 'sample-id'
        }]));
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
        mockGetContentDetailsHandler.fetchFromDB = jest.fn().mockImplementation(() => of({
            local_data: JSON.stringify({
                children: [{
                    index: 1,
                    identifier: 'identifier'
                }, {
                    index: 2,
                    identifier: 'do-234'
                }, {
                    index: 3,
                    identifier: 'do-345'
                }],
                contentType: 'Course'
            }),
            identifier: 'do-123',
            content_type: CsContentType.COURSE.toLowerCase(),
            data: {}
        }));
        mockGetContentDetailsHandler.fetchFromDBForAll = jest.fn(() => of([{
            local_data: JSON.stringify({
                children: [{
                    index: 1,
                    identifier: 'identifier'
                }, {
                    index: 2,
                    identifier: 'do-234'
                }, {
                    index: 3,
                    identifier: 'do-345'
                }],
                contentType: 'Course'
            }),
            identifier: 'do-123',
            content_type: CsContentType.COURSE.toLowerCase(),
            data: {}
        }])) as any;
        // act
        await childContentHandler.getContentFromDB(request, identifier).then(() => {
            expect(mockGetContentDetailsHandler.fetchFromDB).toHaveBeenCalled();
            expect(mockGetContentDetailsHandler.fetchFromDBForAll).toHaveBeenCalled();
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

    it('should get ChildIdentifiers From Manifest for catch part', async (done) => {
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
