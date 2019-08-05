import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SummarizerServiceImpl } from './summarizer-service-impl';
import { SummarizerService } from '..';
import { DbService } from '../../db';
import { ContentService } from '../../content';
import { EventsBusService, EventNamespace } from '../../events-bus';
import { CourseService } from '../../course';
import { SharedPreferences } from '../../util/shared-preferences';
import { ProfileService } from '../../profile';
import { Observable } from 'rxjs';
import { SummarizerQueries } from '..';
import { SummaryRequest } from '../def/request';
import { ContentRequest } from '../../content/def/requests';
import { SunbirdTelemetry } from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;
import { Actor, Context, TelemetryObject, ProducerData } from '../../telemetry/def/telemetry-model';
import { TelemetryAuditRequest, TelemetryService } from '../../telemetry';
import { TelemetryEventType, TelemetryEvent } from '../../telemetry/def/telemetry-event';
import { LearnerSummaryEntry } from '../../profile/db/schema';

describe('SummarizerServiceImpl', () => {
    let summarizerService: SummarizerService;

    const container = new Container();
    const dbServiceMock: Partial<DbService> = {};
    const contentServiceMock: Partial<ContentService> = {
        getContents: jest.fn(() => { })
    };
    const eventsBusServiceMock: Partial<EventsBusService> = {
        registerObserver: jest.fn(() => {
        }),
    };
    const courseServiceMock: Partial<CourseService> = {};
    const sharedPreferencesMock: Partial<SharedPreferences> = {
    };
    const profileServiceMock: Partial<ProfileService> = {};
    const mockSummarizerQueries: Partial<SummarizerQueries> = {
        getQuetsionDetailsQuery: jest.fn(() => { })
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        audit(request: TelemetryAuditRequest): Observable<boolean> {
            return Observable.of(true);
        }
    };

    beforeAll(() => {
        container.bind<SummarizerService>(InjectionTokens.SUMMARIZER_SERVICE).to(SummarizerServiceImpl);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(dbServiceMock as DbService);
        container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).toConstantValue(contentServiceMock as ContentService);
        container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).toConstantValue(eventsBusServiceMock as EventsBusService);
        container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).toConstantValue(courseServiceMock as CourseService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(sharedPreferencesMock as SharedPreferences);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(profileServiceMock as ProfileService);
        container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).toConstantValue(mockTelemetryService as TelemetryService);

        summarizerService = container.get<SummarizerService>(InjectionTokens.SUMMARIZER_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return an instance from container', () => {
        // assert
        expect(summarizerService).toBeTruthy();
    });

    it('should register self as eventBus observer onInit()', () => {
        // arrange
        (eventsBusServiceMock.registerObserver as jest.Mock).mockReturnValue(Observable.of(''));
        // act
        summarizerService.onInit()
            .subscribe(() => {
                // assert
                expect(eventsBusServiceMock.registerObserver).toHaveBeenCalledWith(
                    expect.objectContaining({
                        namespace: EventNamespace.TELEMETRY,
                        observer: summarizerService
                    })
                );
            });
    });

    it('get details per Question getDetailsPerQuestion()', (done) => {
        // arrange
        const request: SummaryRequest = {
            qId: 'SAMPLE_QID',
            uids: ['SAMPLE_UID_1', 'SAMPLE_UID_2'],
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyData: 'SAMPLE_HIERARCHY_DATA'
        };
        dbServiceMock.execute = jest.fn(() => Observable.of([]));

        // act
        summarizerService.getDetailsPerQuestion(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalledWith(
                expect.stringContaining(`WHERE uid IN('SAMPLE_UID_1','SAMPLE_UID_2')`));
            done();
        });
    });

    it('get Assessment Details getLearnerAssessmentDetails()', (done) => {
        // arrange
        const request: SummaryRequest = {
            qId: 'SAMPLE_QID',
            uids: ['SAMPLE_UID_1', 'SAMPLE_UID_2'],
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyData: 'SAMPLE_HIERARCHY_DATA'
        };
        dbServiceMock.execute = jest.fn(() => Observable.of([]));
        // act
        summarizerService.getLearnerAssessmentDetails(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalledWith(
                expect.stringContaining(`WHERE la.uid IN('SAMPLE_UID_1','SAMPLE_UID_2')`));
            done();
        });
    });

    it('should be generate report by question ', (done) => {
        // arrange
        const request: SummaryRequest = {
            qId: 'SAMPLE_QID',
            uids: ['SAMPLE_UID_1', 'SAMPLE_UID_2'],
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyData: 'SAMPLE_HIERARCHY_DATA'
        };
        dbServiceMock.execute = jest.fn(() => Observable.of([]));
        // act
        summarizerService.getReportByQuestions(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalledWith(
                expect.stringContaining(`WHERE uid IN('SAMPLE_UID_1','SAMPLE_UID_2')`));
            done();
        });
    });

    it('should be generate report by users ', (done) => {
        // arrange
        const request: SummaryRequest = {
            qId: 'SAMPLE_QID',
            uids: ['SAMPLE_UID_1', 'SAMPLE_UID_2'],
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyData: 'SAMPLE_HIERARCHY_DATA'
        };
        dbServiceMock.execute = jest.fn(() => Observable.of([]));
        // act
        summarizerService.getReportsByUser(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalledWith(
                expect.stringContaining(`WHERE la.uid IN('SAMPLE_UID_1','SAMPLE_UID_2')`));
            done();
        });
    });

    it('get learner assessment details like name, total score, earn score', (done) => {
        // arrange
        const request: SummaryRequest = {
            qId: 'SAMPLE_QID',
            uids: ['SAMPLE_UID_1', 'SAMPLE_UID_2'],
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyData: 'SAMPLE_HIERARCHY_DATA'
        };
        dbServiceMock.execute = jest.fn(() => Observable.of([]));
        spyOn(summarizerService, 'getContentCache').and.returnValue(Observable.of(('SAMPLE_UID')));
        // act
        summarizerService.getSummary(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalled();
            done();
        });
    });

    it('get content for assessment', () => {
        // arrange
        const uids = ['SAMPLE_UID_1', 'SAMPLE_UID_2'];
        contentServiceMock.getContents = jest.fn(() => Observable.of([]));
        // act
        summarizerService.getContentCache(uids).subscribe(() => {
            // assert
            expect(contentServiceMock.getContents).toHaveBeenCalled();
        });
    });

    it('delete previous assessment from DB', (done) => {
        // arrange
        const uids = 'SAMPLE_UID';
        const contentId = 'SAMPLE_CONTENT_ID';
        dbServiceMock.read = jest.fn(() => Observable.of([]));
        dbServiceMock.delete = jest.fn(() => Observable.of(undefined));
        // act
        summarizerService.deletePreviousAssessmentDetails(uids, contentId).subscribe(() => {
            // assert
            expect(dbServiceMock.delete).not.toHaveBeenCalled();
            done();
        });
    });
});
