import { DeleteContentHandler } from './delete-content-handler';
import { DbService } from '../../db';
import { FileService } from '../../util/file/def/file-service';
import { SharedPreferences } from '../..';
import { ContentEntry } from '../db/schema';
import {ContentUtil} from '../util/content-util';
// import {buildconfigreader} from '../../../plugins/cordova-plugin-buildconfig-reader';
import { Observable } from 'rxjs';
import { ArrayUtil } from '../../util/array-util';

jest.mock('../util/content-util');
declare const buildconfigreader;

describe('DeleteContentHandler', () => {
    let deleteContentHandler: DeleteContentHandler;

    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        deleteContentHandler = new DeleteContentHandler(
            mockDbService as DbService,
            mockFileService as FileService,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
      //  (ContentUtil as jest.Mock<ContentUtil>).
    });

    it('should be able to create an instance of deleteContentHandler', () => {
        expect(deleteContentHandler).toBeTruthy();
    });

    it('should be deleted all children', async (done) => {
        // arrange
        spyOn(buildconfigreader, 'getMetaData').and.callFake((mapList, cb) => {
            setTimeout(() => {
                cb({
                    'IDENTIFIER': {
                        size: 0
                    }
                });
            });
        });

        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: 'LOCAL_DATA',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        };
        const isChildContent = true;

        // act
        await deleteContentHandler.deleteAllChildren(request, isChildContent).then(() => {
            // assert
          expect(buildconfigreader.getMetaData).toHaveBeenCalled();
          done();
        });
    });

    it('should ', async(done) => {
        // arrange
        spyOn(buildconfigreader, 'getMetaData').and.callFake((mapList, cb) => {
            setTimeout(() => {
                cb({
                    'IDENTIFIER': {
                        size: 0
                    }
                });
            });
        });
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: 'LOCAL_DATA',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        };
        ContentUtil.hasChildren = jest.fn(() => Observable.of([]));
        mockDbService.execute = jest.fn(() => Observable.of([]));
        ArrayUtil.joinPreservingQuotes = jest.fn(() => Observable.of([]));
        // act
        await deleteContentHandler.deleteAllChildren(request, true).then(() => {
            expect(ContentUtil.hasChildren).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
            done();
        });
        // assert
    });

    // fit('should delete child content only', async(done) => {
    //     // arrange
    //     spyOn(buildconfigreader, 'getMetaData').and.callFake((mapList, cb) => {
    //         setTimeout(() => {
    //             cb({
    //                 'IDENTIFIER': {
    //                     size: 0
    //                 }
    //             });
    //         });
    //     });
    //     const request_1: ContentEntry.SchemaMap = {
    //         identifier: 'IDENTIFIER',
    //         server_data: 'SERVER_DATA',
    //         local_data: 'LOCAL_DATA',
    //         mime_type: 'MIME_TYPE',
    //         manifest_version: 'MAINFEST_VERSION',
    //         content_type: 'CONTENT_TYPE',
    //         path: 'SAMPLE_PATH'
    //     };
    //     const request = undefined;
    //  //   spyOn(deleteContentHandler, 'deleteOrUpdateContent').and.stub();
    //     const isUpdateLastModifiedTime = true;
    //     ContentUtil.getFirstPartOfThePathNameOnLastDelimiter = jest.fn(() => Observable.of([]));
    //     // act
    //     await deleteContentHandler.deleteAllChildren(request_1, true).then(() => {
    //       // console.log(expect(request_1[ContentEntry.COLUMN_NAME_IDENTIFIER]).not.toEqual(''));
    //       expect(request_1[ContentEntry.COLUMN_NAME_PATH]).not.toBeNull();
    //       expect(isUpdateLastModifiedTime).toEqual(true);
    //       expect(ContentUtil.getFirstPartOfThePathNameOnLastDelimiter).toHaveBeenCalled();
    //         done();
    //     });
    //     // assert
    // });

    it('should delete or update a content when invoked deleteOrUpdateContent()', () => {
        // arrange
        const request: ContentEntry.SchemaMap = {
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: 'LOCAL_DATA',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        };
        const isChildItems = true;
        const isChildContent = true;
        // act
        deleteContentHandler.deleteOrUpdateContent(request, isChildItems, isChildContent).then(() => {

        });
        // assert
    });

});
