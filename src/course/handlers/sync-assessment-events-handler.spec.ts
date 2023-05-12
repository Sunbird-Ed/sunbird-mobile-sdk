import {SyncAssessmentEventsHandler} from './sync-assessment-events-handler';
import {CourseService} from '..';
import {ApiService, DbService, SdkConfig, SunbirdTelemetry} from '../..';
import {of, throwError} from 'rxjs';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';
import {NetworkQueue} from '../../api/network-queue';

describe('SyncAssessmentEventsHandler', () => {
    let syncAssessmentEventsHandler: SyncAssessmentEventsHandler;
    const mockApiService: Partial<ApiService> = {};
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

    beforeAll(() => {
        syncAssessmentEventsHandler = new SyncAssessmentEventsHandler(
            mockCourseService as CourseService,
            mockSdkConfig as SdkConfig,
            mockDbService as DbService,
            mockNetworkQueue as NetworkQueue
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of syncAssessmentEventsHandler', () => {
        expect(syncAssessmentEventsHandler).toBeTruthy();
    });

    describe('handle()', () => {
        it('should sync captured assessment events only if no persisted assessment events exist', (done) => {
            // arrange
            const capturedAssessmentEvents = {
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT","userId":"SOME_USER_ID"}': [
                    new SunbirdTelemetry.Start(
                        'SOME_TYPE',
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        'SOME_ENV',
                        'SOME_ID'
                    )
                ]
            };
            mockCourseService.generateAssessmentAttemptId  = jest.fn().mockImplementation(() => 'SOME_ASSESSMENT_ID');
            mockApiService.fetch = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            mockDbService.execute = jest.fn().mockImplementation(() => of([]));
            sbsync.onSyncSucces = jest.fn((success, error) => {
                success({courseAssesmentResponse: 'assesment_response'});
            });
            // act
            syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
                // assert
                // expect(mockNetworkQueue.enqueue).toBeCalledTimes(1);
                done();
            });
        });

        it('should sync captured assessment events and persisted assessment events if exists', (done) => {
            // arrange
            const capturedAssessmentEvents = {
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT","userId":"SOME_USER_ID"}': [
                    new SunbirdTelemetry.Start(
                        'SOME_TYPE',
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        'SOME_ENV'
                    )
                ]
            };
            sbsync.onSyncSucces = jest.fn((success, error) => {
                success({courseAssesmentResponse: 'assesment_response'});
            });
            mockCourseService.generateAssessmentAttemptId  = jest.fn().mockImplementation(() => 'SOME_ASSESSMENT_ID');
            mockApiService.fetch = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            mockDbService.execute = jest.fn().mockImplementation(() => of([
                {
                    first_ts: 0,
                    events: '{}, {}',
                    [CourseAssessmentEntry.COLUMN_NAME_USER_ID]: 'SOME_UDER_ID',
                    [CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID]: 'SOME_CONTENT_ID',
                    [CourseAssessmentEntry.COLUMN_NAME_COURSE_ID]: 'SOME_COURSE_ID',
                    [CourseAssessmentEntry.COLUMN_NAME_BATCH_ID]: 'SOME_BATCH_ID'
                }
            ]));
            // act
            syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
                // assert
                // expect(mockNetworkQueue.enqueue).toBeCalledTimes(2);
                done();
            });
        });

        it('should persist captured assessment events if sync fails', (done) => {
            // arrange
            const capturedAssessmentEvents = {
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT","userId":"SOME_USER_ID"}': [
                    new SunbirdTelemetry.Start(
                        'SOME_TYPE',
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        'SOME_ENV'
                    )
                ]
            };
            mockApiService.fetch = jest.fn().mockImplementation(() => throwError(new Error('SOME_ERROR')));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            sbsync.onSyncSucces = jest.fn((_, error) => {
                error({course_assesment_error: 'assesment_error'});
            }) as any;
            // act
            syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
                // assert
                expect(mockDbService.insert).toHaveBeenCalled();
                done();
            });
        });
    });
});
