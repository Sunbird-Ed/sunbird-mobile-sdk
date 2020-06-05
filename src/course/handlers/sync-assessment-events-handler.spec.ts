import { SyncAssessmentEventsHandler } from './sync-assessment-events-handler';
import { CourseService } from '..';
import { SdkConfig, ApiService, DbService, SunbirdTelemetry } from '../..';
import {of, throwError} from 'rxjs';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';

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

    beforeAll(() => {
        syncAssessmentEventsHandler = new SyncAssessmentEventsHandler(
            mockCourseService as CourseService,
            mockSdkConfig as SdkConfig,
            mockApiService as ApiService,
            mockDbService as DbService
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
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT"}': [
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
            mockCourseService.generateAssessmentAttemptId  = jest.fn().mockImplementation(() => 'SOME_ASSESSMENT_ID');
            mockApiService.fetch = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            mockDbService.execute = jest.fn().mockImplementation(() => of([]));
            // act
            syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
                // assert
                expect(mockApiService.fetch).toBeCalledTimes(1);
                done();
            });
        });

        it('should sync captured assessment events and persisted assessment events if exists', (done) => {
            // arrange
            const capturedAssessmentEvents = {
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT"}': [
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
                expect(mockApiService.fetch).toBeCalledTimes(2);
                done();
            });
        });

        it('should persist captured assessment events if sync fails', (done) => {
            // arrange
            const capturedAssessmentEvents = {
                '{"batchStatus": 1,"courseId":"SOME_ID","contentId":"SOME_CONTENT"}': [
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
            // act
            syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
                // assert
                expect(mockDbService.insert).toHaveBeenCalled();
                done();
            });
        });
    });
});
