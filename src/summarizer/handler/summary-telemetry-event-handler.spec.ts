import { SummaryTelemetryEventHandler } from './summary-telemetry-event-handler';
import { CourseService, SharedPreferences, EventsBusService, ContentService, ProfileService, DbService } from '../..';
import { SummarizerService } from '..';
import { telemetry } from './summary-telemetry-event-handler.spec.data';
import { of } from 'rxjs';
import { ContentKeys } from '../../preference-keys';

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
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));

        mockProfileService.addContentAccess = jest.fn().mockImplementation(() => { });
        (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(of(true));
        mockCourseService.getContentState = jest.fn().mockImplementation(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(of({}));
        // act
        mockCourseService.updateContentState = jest.fn().mockImplementation(() => { });
        (mockCourseService.updateContentState as jest.Mock).mockReturnValue(of(true));
        mockSharedPreference.putString = jest.fn().mockImplementation(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(of('SAMPLE_RESULT'));
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
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));
        mockCourseService.getContentState = jest.fn().mockImplementation(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(of({}));
        mockContentService.getContentDetails = jest.fn().mockImplementation(() => { });
        (mockContentService.getContentDetails as jest.Mock).mockReturnValue(of({ name: 'CONTENT_NAME', contentType: 'course', sections: {} }));
        telemetry.edata.summary = [{ progress: 100 }];
        mockEventBusService.emit = jest.fn().mockImplementation(() => { });
        (mockEventBusService.emit as jest.Mock).mockReturnValue(of());
        mockSharedPreference.putString = jest.fn().mockImplementation(() => { });
        // act
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(of('SAMPLE_RESULT'));
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
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id", "batchStatus": 1}'));

        // mockProfileService.addContentAccess = jest.fn().mockImplementation(() => { });
        // (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(of(true));
        mockCourseService.getContentState = jest.fn().mockImplementation(() => { });
        (mockCourseService.getContentState as jest.Mock).mockReturnValue(of({}));
        mockContentService.getContentDetails = jest.fn().mockImplementation(() => { });
        (mockContentService.getContentDetails as jest.Mock).mockReturnValue(of({
            name: 'CONTENT_NAME', sections: {},
            contentType: 'SELFASSESS'
        }));
        mockCourseService.hasCapturedAssessmentEvent = jest.fn().mockImplementation(() => { });
        (mockCourseService.hasCapturedAssessmentEvent as jest.Mock).mockReturnValue(true);
        telemetry.edata.summary = [{ progress: -2 }];
        mockEventBusService.emit = jest.fn().mockImplementation(() => { });
        (mockEventBusService.emit as jest.Mock).mockReturnValue(of());
        // mockCourseService.updateContentState = jest.fn().mockImplementation(() => {});
        // (mockCourseService.updateContentState as jest.Mock).mockReturnValue(of(true));
        mockSharedPreference.putString = jest.fn().mockImplementation(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(of('SAMPLE_RESULT'));
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
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        const data = (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of(''));
        JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
            return data;
        });

        mockProfileService.addContentAccess = jest.fn().mockImplementation(() => { });
        (mockProfileService.addContentAccess as jest.Mock).mockReturnValue(of(true));
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
        mockCourseService.resetCapturedAssessmentEvents = () => of('DEFAULT_CHANNEL');
        // act
        summaryTelemetryEventHandler.handle(telemetry).subscribe(() => {
            // assert
            done();
        });
    });

    it('should implement for course service event telemetry', (done) => {
        // arrange
        telemetry.context.pdata.pid = 'sunbird.app';
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        const data = (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id"}'));
        JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
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
        mockSharedPreference.getString = jest.fn().mockImplementation(() => { });
        await (mockSharedPreference.getString as jest.Mock)
            .mockReturnValue(of('{"userId": "user_id","courseId": "course_Id","batchId": "batch_id"}'));

        mockSummarizerService.deletePreviousAssessmentDetails = jest.fn().mockImplementation(() => { });
        (mockSummarizerService.deletePreviousAssessmentDetails as jest.Mock).mockReturnValue(of({
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
        mockSharedPreference.putString = jest.fn().mockImplementation(() => { });
        const data = (mockSharedPreference.putString as jest.Mock).mockReturnValue(of('SAMPLE_RESULT'));

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
