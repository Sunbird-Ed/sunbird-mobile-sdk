import {Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SummarizerServiceImpl} from './summarizer-service-impl';
import {SummarizerService, SummaryRequest} from '..';
import {DbService} from '../../db';
import {ContentService} from '../../content';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {CourseService} from '../../course';
import {SharedPreferences} from '../../util/shared-preferences';
import {ProfileService} from '../../profile';
import {Observable, of} from 'rxjs';
import {TelemetryAuditRequest, TelemetryService} from '../../telemetry';

describe('SummarizerServiceImpl', () => {
    let summarizerService: SummarizerService;

    const container = new Container();
    const dbServiceMock: Partial<DbService> = {};
    const contentServiceMock: Partial<ContentService> = {
        getContents: jest.fn().mockImplementation(() => {
        })
    };
    const eventsBusServiceMock: Partial<EventsBusService> = {
        registerObserver: jest.fn().mockImplementation(() => {
        }),
    };
    const courseServiceMock: Partial<CourseService> = {};
    const sharedPreferencesMock: Partial<SharedPreferences> = {};
    const profileServiceMock: Partial<ProfileService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        audit(request: TelemetryAuditRequest): Observable<boolean> {
            return of(true);
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
        (eventsBusServiceMock.registerObserver as jest.Mock).mockReturnValue(of(''));
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
        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));

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
        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));
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
        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));
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
        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));
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
        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));
        const results = [
            {
                identifier: 'SOME_IDENTOFIER',
                contentData: {
                    name: 'SOME_NAME',
                    totalScore: 'SOME_SCORE'
                },
                lastUsedTime: 100
            }
        ];
        contentServiceMock.getContents = jest.fn().mockImplementation(() => of(results));
        // act
        summarizerService.getSummary(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should delete previous assessment from DB', (done) => {
        // arrange
        const uids = 'SAMPLE_UID';
        const contentId = 'SAMPLE_CONTENT_ID';
        dbServiceMock.read = jest.fn().mockImplementation(() => of([]));
        dbServiceMock.delete = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.deletePreviousAssessmentDetails(uids, contentId).subscribe(() => {
            // assert
            expect(dbServiceMock.delete).not.toHaveBeenCalled();
            done();
        });
    });
});
