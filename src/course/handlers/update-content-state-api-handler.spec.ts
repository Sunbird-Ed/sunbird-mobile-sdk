import {CourseService} from '..';
import {SdkConfig, ApiService, DbService, SunbirdTelemetry} from '../..';
import {of, throwError} from 'rxjs';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';
import {NetworkQueue} from '../../api/network-queue';
import {UpdateContentStateApiHandler} from './update-content-state-api-handler';
import { UniqueId } from '../../db/util/unique-id';

describe('UpdateContentStateApiHandler', () => {
  let updateContentStateApiHandler: UpdateContentStateApiHandler;
  const mockSdkConfig: Partial<SdkConfig> = {
    courseServiceConfig: {
      apiPath: 'SOME_PATH'
    }
  };
  const mockCourseService: Partial<CourseService> = {};
  const mockDbService: Partial<DbService> = {};
  const mockNetworkQueue: Partial<NetworkQueue> = {
    enqueue: jest.fn(() => of({} as any))
  };
  jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
  beforeAll(() => {
    updateContentStateApiHandler = new UpdateContentStateApiHandler(
      mockNetworkQueue as NetworkQueue,
      mockSdkConfig as SdkConfig
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create a instance of syncAssessmentEventsHandler', () => {
    expect(updateContentStateApiHandler).toBeTruthy();
  });

  describe('handle()', () => {
    it('should enqueue the progress information', (done) => {
      // arrange
      jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
      sbsync.onSyncSucces = jest.fn((success, error) => {
        success({courseProgressResponse: 'progress_response'});
      });
      // act
      updateContentStateApiHandler.handle({} as any).subscribe((e) => {
        // assert
        expect(mockNetworkQueue.enqueue).toBeCalledTimes(1);
        expect(e).toBe('progress_response');
        done();
      });
    });

      it('should send the error response returned from network queue', () => {
          // arrange
          jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
          sbsync.onSyncSucces = jest.fn((_, error) => {
              // error({course_progress_error: 'progress_response_error'});
          });
          // act
          updateContentStateApiHandler.handle({} as any).subscribe((e) => {
              // assert
          }, (error) => {
            setTimeout(() => {
              expect(mockNetworkQueue.enqueue).toBeCalledTimes(1);
              expect(error).toEqual({course_progress_error: 'progress_response_error'});
            }, 0);
          });
      });
  });
});
