import { SummaryTelemetryEventHandler } from './summary-telemetry-event-handler';
import { CourseService, SharedPreferences, EventsBusService, ContentService, ProfileService, DbService } from '../..';
import { SummarizerService } from '..';
import { telemetry } from './summary-telemetry-event-handler.spec.data';
import { Observable } from 'rxjs';

describe('SummaryTelemetryEventHandler', () => {
    let summaryTelemetryEventHandler: SummaryTelemetryEventHandler;
    const mockCourseService: Partial<CourseService> = {};
    const mockSharedPreference: Partial<SharedPreferences> = {};
    const mockSummarizerService: Partial<SummarizerService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        summaryTelemetryEventHandler = new SummaryTelemetryEventHandler(
            mockCourseService as CourseService,
            mockSharedPreference as SharedPreferences,
            mockSummarizerService as SummarizerService,
            mockEventBusService as EventsBusService,
            mockContentService as ContentService,
            mockProfileService as ProfileService,
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of summaryTelemetryEventHandler', () => {
        expect(summaryTelemetryEventHandler).toBeTruthy();
    });

    it('should update content state if batch is not expire for START event', (done) => {
        // arrange
        mockSharedPreference.getString = jest.fn(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));

        mockProfileService.addContentAccess = jest.fn(() => { });
        (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(Observable.of(true));
        mockCourseService.getContentState = jest.fn(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(Observable.of({}));
        // act
        mockCourseService.updateContentState = jest.fn(() => { });
        (mockCourseService.updateContentState as jest.Mock).mockReturnValue(Observable.of(true));
        mockSharedPreference.putString = jest.fn(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(Observable.of('SAMPLE_RESULT'));
        summaryTelemetryEventHandler.updateContentState(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            expect(mockProfileService.addContentAccess).toBeTruthy();
            expect(mockCourseService.getContentState).toHaveBeenCalled();
            expect(mockSharedPreference.putString).toHaveBeenCalled();
            done();
        });
    });

    it('should update content state if batch is not expire END event', (done) => {
        // arrange
        telemetry.eid = 'END';
        mockSharedPreference.getString = jest.fn(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));
        mockCourseService.getContentState = jest.fn(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(Observable.of({}));
        mockContentService.getContentDetails = jest.fn(() => { });
        (mockContentService.getContentDetails as jest.Mock).mockReturnValue(Observable.of({ name: 'CONTENT_NAME', sections: {} }));
        telemetry.edata.summary = [{ progress: 100 }];
        mockEventBusService.emit = jest.fn(() => { });
        (mockEventBusService.emit as jest.Mock).mockReturnValue(Observable.of());
        mockSharedPreference.putString = jest.fn(() => { });
        // act
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(Observable.of('SAMPLE_RESULT'));
        // act
        summaryTelemetryEventHandler.updateContentState(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            expect(mockCourseService.getContentState).toHaveBeenCalled();
            expect(mockContentService.getContentDetails).toHaveBeenCalled();
            expect(mockEventBusService.emit).toHaveBeenCalled();
            expect(mockSharedPreference.putString).toHaveBeenCalled();
            done();
        });
    });

    it('should update content state if batch is not expire for Invalid END event', (done) => {
        // arrange
        telemetry.eid = 'END';
        mockSharedPreference.getString = jest.fn(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));

        // mockProfileService.addContentAccess = jest.fn(() => { });
        // (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(Observable.of(true));
        mockCourseService.getContentState = jest.fn(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(Observable.of({}));
        mockContentService.getContentDetails = jest.fn(() => { });
        (mockContentService.getContentDetails as jest.Mock).mockReturnValue(Observable.of({
         name: 'CONTENT_NAME', sections: {},
         contentType: 'SELFASSESS' }));
         mockCourseService.hasCapturedAssessmentEvent = jest.fn(() => {});
         (mockCourseService.hasCapturedAssessmentEvent as jest.Mock).mockReturnValue(true);
        telemetry.edata.summary = [{ progress: -2 }];
        mockEventBusService.emit = jest.fn(() => { });
        (mockEventBusService.emit as jest.Mock).mockReturnValue(Observable.of());
        // mockCourseService.updateContentState = jest.fn(() => {});
        // (mockCourseService.updateContentState as jest.Mock).mockReturnValue(Observable.of(true));
        mockSharedPreference.putString = jest.fn(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(Observable.of('SAMPLE_RESULT'));
        // act
        summaryTelemetryEventHandler.updateContentState(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            expect(mockCourseService.getContentState).toHaveBeenCalled();
            expect(mockContentService.getContentDetails).toHaveBeenCalled();
            expect(mockSharedPreference.putString).toHaveBeenCalled();
            done();
        });
    });

    it('should not update content state if batch is expired', (done) => {
        // arrange
        telemetry.eid = 'START';
        mockSharedPreference.getString = jest.fn(() => { });
        const data = (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of(''));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
        });

        mockProfileService.addContentAccess = jest.fn(() => { });
        (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(Observable.of(true));
        // act
        summaryTelemetryEventHandler.updateContentState(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            expect(mockProfileService.addContentAccess).toBeTruthy();
            done();
        });
    });

    it('should added content in content marker table for pid is contentPlayer', (done) => {
        // arrange
        mockCourseService.resetCapturedAssessmentEvents = () => Observable.of('DEFAULT_CHANNEL');
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            done();
        });
    });

    it('should implement for course service event telemetry', (done) => {
        // arrange
        telemetry.context.pdata.pid = 'sunbird.app';
        mockSharedPreference.getString = jest.fn(() => { });
        const data = (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id"}'));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
        });
        // telemetry.object.type = 'course';
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalledWith(expect.any(String));
            done();
        });
    });

    it('should delete previous assessment details for ASSESS event', async (done) => {
        // arrange
        telemetry.eid = 'ASSESS';
        telemetry.context.pdata.pid = 'contentplayer';
        mockSharedPreference.getString = jest.fn(() => { });
        await (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(Observable.of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id"}'));

        mockSummarizerService.deletePreviousAssessmentDetails = jest.fn(() => { });
        (mockSummarizerService.deletePreviousAssessmentDetails as jest.Mock).mockReturnValue(Observable.of({
            currentUID: undefined,
            currentContentID: undefined
        }));
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            expect(mockSummarizerService.deletePreviousAssessmentDetails).toHaveBeenCalled();
            done();
        });
    });

    it('should delete previous assessment details for END event', (done) => {
        // arrange
        telemetry.eid = 'END';
        mockSharedPreference.putString = jest.fn(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(Observable.of('SAMPLE_RESULT'));

        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            expect(mockSharedPreference.getString).toHaveBeenCalled();
            done();
        });
    });

    it('should generate telemetry for END event and invoked setCourseContextEmpty()', (done) => {
        // arrange
        telemetry.eid = 'END';
        telemetry.context.pdata.pid = 'sunbird.app';
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
         //   expect(mockCourseService.updateContentState).toHaveBeenCalled();
            done();
        });
    });

    it('should generate telemetry for END event and invoked setCourseContextEmpty()', (done) => {
        // arrange
        telemetry.eid = 'ERROR';
        telemetry.context.pdata.pid = 'sunbird.app';
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            done();
        });
    });

});
