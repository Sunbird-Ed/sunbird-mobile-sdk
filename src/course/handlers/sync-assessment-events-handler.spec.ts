import { SyncAssessmentEventsHandler } from './sync-assessment-events-handler';
import { CourseService } from '..';
import { SdkConfig, ApiService, DbService, SunbirdTelemetry } from '../..';
import { of } from 'rxjs';

describe('SyncAssessmentEventsHandler', () => {
    let syncAssessmentEventsHandler: SyncAssessmentEventsHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};
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

    it('should sync capture assessment events', (done) => {
        // arrange
        const capturedAssessmentEvents = {};
        mockDbService.insert = jest.fn(() => of(1));
        // act
        syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
            // assert
          expect(e).toEqual(undefined);
            done();
        });
    });

    it('should sync capture assessment events for catch part', (done) => {
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
        mockDbService.insert = jest.fn(() => of(1));
        // act
        syncAssessmentEventsHandler.handle(capturedAssessmentEvents).subscribe((e) => {
            // assert
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
