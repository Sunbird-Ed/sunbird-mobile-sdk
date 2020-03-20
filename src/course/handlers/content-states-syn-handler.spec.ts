import { ContentStatesSyncHandler } from './content-states-sync-handler';
import { UpdateContentStateApiHandler } from './update-content-state-api-handler';
import { DbService, SharedPreferences, UpdateContentStateRequest, CourseServiceImpl } from '../..';
import { KeyValueStore } from '../../key-value-store';
import { of } from 'rxjs';
import { CourseUtil } from '../course-util';

jest.mock('./update-content-state-api-handler');

describe('ContentStatesSyncHandler', () => {
    let contentStatesSyncHandler: ContentStatesSyncHandler;
    const mockUpdateContentStateHandler: Partial<UpdateContentStateApiHandler> = {};
    const mockDbService: Partial<DbService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};

    beforeAll(() => {
        contentStatesSyncHandler = new ContentStatesSyncHandler(
            mockUpdateContentStateHandler as UpdateContentStateApiHandler,
            mockDbService as DbService,
            mockSharedPreferences as SharedPreferences,
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (UpdateContentStateApiHandler as any as jest.Mock<UpdateContentStateApiHandler>).mockClear();
    });

    it('should be create a instance of contentStatesSyncHandler', () => {
        expect(contentStatesSyncHandler).toBeTruthy();
    });

    it('should updated content state', async(done) => {
        // arrange
        jest.spyOn(CourseUtil, 'getUpdateContentStateListRequest').mockReturnValue({userId: 's-uid', contents: []});
        const mockUpdateContentStateHandler2 = {
            handle: jest.fn().mockImplementation(() => of({'uid': 'suid', 'content-id': 'FAILED'}))
        };

        contentStatesSyncHandler = new ContentStatesSyncHandler(
            mockUpdateContentStateHandler2 as any as UpdateContentStateApiHandler,
            mockDbService as DbService,
            mockSharedPreferences as SharedPreferences,
            mockKeyValueStore as KeyValueStore
        );
       mockDbService.execute = jest.fn().mockImplementation(() => of([{
            key: 'sample-key',
            value: '{"userId": "sampleid"}'
        }]));
        const data: UpdateContentStateRequest = {
            userId: 's-uid',
            courseId: 'c-id',
            contentId: 'content-id',
            batchId: 'batch-id'
        };
        JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
            return data;
          });
          mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('sample-value'));
        // act
        contentStatesSyncHandler.updateContentState().subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockKeyValueStore.getValue).not.toHaveBeenCalledWith(CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX);
            done();
        });
    });
});
