import {Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SummarizerServiceImpl} from './summarizer-service-impl';
import {SummarizerService, SummaryRequest} from '..';
import {DbService} from '../../db';
import {ContentRequest, ContentService} from '../../content';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {CourseService} from '../../course';
import {SharedPreferences} from '../../util/shared-preferences';
import {ProfileService} from '../../profile';
import {Observable, of} from 'rxjs';
import {SunbirdTelemetry, TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {LearnerSummaryEntry} from '../../profile/db/schema';

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
        jest.resetAllMocks();
        jest.clearAllMocks();
        jest.restoreAllMocks();
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
        const contentRequest: ContentRequest = {resourcesOnly: true, primaryCategories: [], uid: request.uids};
        // act
        summarizerService.getSummary(request).subscribe(() => {
            // assert
            expect(dbServiceMock.execute).toHaveBeenCalled();
            expect(contentServiceMock.getContents).toHaveBeenCalledWith(expect.objectContaining(contentRequest));
            done();
        });
    });

    it('should insert learner assessment details  in DB - saveLearnerAssessmentDetails', (done) => {
        // arrange
        const mockEndEvent = new SunbirdTelemetry.Start('SOME_TYPE', undefined, 'SOME_LOC',
            'SOME_MODE', 10, 'SOME_PAGE_ID', 'SOME_ENV', 'SOME_OBJ_ID',
            'OBJ_TYPE', 'SOME_OBJ_VER', {}, []);
        mockEndEvent.ets = 100;
        mockEndEvent.actor.id = 'SOME_UID';
        mockEndEvent.edata.item = {
            id: 'SOME_QUESTION_ID',
            desc: 'SOME_QUESTION_DESC',
            title: 'SOME_QUESTION_TITLE',
            score: '1',
            maxscore: '2',
            qindex: '1'
        };
        mockEndEvent.context.cdata = [
            {
                type: 'Collection',
                id: 'SOME_CDATA_ID_1'
            },
            {
                type: 'TextBook',
                id: 'SOME_CDATA_ID_2'
            }
        ];

        dbServiceMock.execute = jest.fn().mockImplementation(() => of([]));
        dbServiceMock.insert = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.saveLearnerAssessmentDetails(mockEndEvent).subscribe(() => {
            // assert
            expect(dbServiceMock.insert).toHaveBeenCalledWith(expect.objectContaining({
                    'modelJson': {
                        'content_id': 'SOME_OBJ_ID',
                        'correct': 0,
                        'h_data': '',
                        'max_score': 2,
                        'qdesc': 'SOME_QUESTION_DESC',
                        'qid': 'SOME_QUESTION_ID',
                        'qindex': NaN,
                        'qtitle': 'SOME_QUESTION_TITLE',
                        'res': undefined,
                        'score': NaN,
                        'time_spent': NaN,
                        'timestamp': 100,
                        'uid': 'SOME_UID'
                    }, 'table': 'learner_assessments'
                }
            ));
            done();
        });
    });

    it('should update learner assessment details  in DB - saveLearnerAssessmentDetails', (done) => {
        // arrange
        const mockEndEvent = new SunbirdTelemetry.Start('SOME_TYPE', undefined, 'SOME_LOC',
            'SOME_MODE', 10, 'SOME_PAGE_ID', 'SOME_ENV', 'SOME_OBJ_ID',
            'OBJ_TYPE', 'SOME_OBJ_VER', {}, []);
        mockEndEvent.ets = 100;
        mockEndEvent.actor.id = 'SOME_UID';
        mockEndEvent.edata.item = {
            id: 'SOME_QUESTION_ID',
            desc: 'SOME_QUESTION_DESC',
            title: 'SOME_QUESTION_TITLE',
            score: '1',
            maxscore: '2',
            qindex: '1'
        };

        const mockLearnerAssessmentsEntry = [
            {
                [LearnerSummaryEntry.COLUMN_NAME_SESSIONS]: 1
            }
        ];

        dbServiceMock.execute = jest.fn().mockImplementation(() => of(mockLearnerAssessmentsEntry));
        dbServiceMock.update = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.saveLearnerAssessmentDetails(mockEndEvent).subscribe(() => {
            // assert
            expect(dbServiceMock.update).toHaveBeenCalledWith(expect.objectContaining({
                    'modelJson': {
                        'content_id': 'SOME_OBJ_ID',
                        'correct': 0,
                        'h_data': '',
                        'max_score': 2,
                        'qdesc': 'SOME_QUESTION_DESC',
                        'qid': 'SOME_QUESTION_ID',
                        'qindex': NaN,
                        'qtitle': 'SOME_QUESTION_TITLE',
                        'res': undefined,
                        'score': NaN,
                        'time_spent': NaN,
                        'timestamp': 100,
                        'uid': 'SOME_UID'
                    }, 'selection': 'uid = ? AND content_id = ? AND h_data = ? AND qid = ? ',
                    'selectionArgs': ['SOME_UID', 'SOME_OBJ_ID', '', 'SOME_QUESTION_ID'],
                    'table': 'learner_assessments'
                }
            ));
            done();
        });
    });

    it('should insert learner content summary details in DB - saveLearnerContentSummaryDetails', (done) => {
        // arrange
        const mockEndEvent = new SunbirdTelemetry.End('SOME_TYPE', 'SOME_MODE', 10,
            'SOME_PAGE_ID', ['summaryList'], 'SOME_ENV', 'SOME_OBJ_ID',
            'OBJ_TYPE', 'SOME_OBJ_VER', {}, []);
        mockEndEvent.ets = 100;
        mockEndEvent.actor.id = 'SOME_UID';
        dbServiceMock.read = jest.fn().mockImplementation(() => of([]));
        dbServiceMock.insert = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.saveLearnerContentSummaryDetails(mockEndEvent).subscribe(() => {
            // assert
            expect(dbServiceMock.insert).toHaveBeenCalledWith(expect.objectContaining({
                    'modelJson': {
                        'avg_ts': 10,
                        'content_id': 'SOME_OBJ_ID',
                        'h_data': '',
                        'last_updated_on': 100,
                        'sessions': 1,
                        'total_ts': 10,
                        'uid': 'SOME_UID'
                    }, 'table': 'learner_content_summary'
                }
            ));
            done();
        });
    });

    it('should update learner content summary details in DB - saveLearnerContentSummaryDetails', (done) => {
        // arrange
        const mockEndEvent = new SunbirdTelemetry.End('SOME_TYPE', 'SOME_MODE', 10,
            'SOME_PAGE_ID', ['summaryList'], 'SOME_ENV', 'SOME_OBJ_ID',
            'OBJ_TYPE', 'SOME_OBJ_VER', {}, []);
        mockEndEvent.ets = 100;
        mockEndEvent.actor.id = 'SOME_UID';
        const mockLearnerAssessmentsEntry = [
            {
                [LearnerSummaryEntry.COLUMN_NAME_SESSIONS]: 1
            }
        ];
        dbServiceMock.read = jest.fn().mockImplementation(() => of(mockLearnerAssessmentsEntry));
        dbServiceMock.update = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.saveLearnerContentSummaryDetails(mockEndEvent).subscribe(() => {
            // assert
            expect(dbServiceMock.update).toHaveBeenCalledWith(expect.objectContaining({
                    'modelJson': {
                        'avg_ts': NaN,
                        'content_id': 'SOME_OBJ_ID',
                        'h_data': '',
                        'last_updated_on': 100,
                        'sessions': 2,
                        'total_ts': 10,
                        'uid': 'SOME_UID'
                    }, 'selection': 'uid = ? AND content_id = ? AND h_data = ? ',
                    'selectionArgs': ['SOME_UID', 'SOME_OBJ_ID', ''], 'table': 'learner_content_summary'
                }
            ));
            done();
        });
    });

    it('should not delete previous assessment from DB if not there in DB', (done) => {
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

    it('should delete previous assessment from DB', (done) => {
        // arrange
        const uid = 'SAMPLE_UID';
        const contentId = 'SAMPLE_CONTENT_ID';
        const mockSummariesinDb = [
            {
                [LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID]: contentId,
                [LearnerSummaryEntry.COLUMN_NAME_UID]: uid
            }
        ];

        dbServiceMock.read = jest.fn().mockImplementation(() => of(mockSummariesinDb));
        dbServiceMock.delete = jest.fn().mockImplementation(() => of(undefined));
        // act
        summarizerService.deletePreviousAssessmentDetails(uid, contentId).subscribe(() => {
            // assert
            expect(dbServiceMock.delete).toHaveBeenNthCalledWith(1, expect.objectContaining({
                'selection': 'content_id = ? AND uid = ?',
                'selectionArgs': ['SAMPLE_CONTENT_ID', 'SAMPLE_UID'],
                'table': 'learner_content_summary'
            }));
            expect(dbServiceMock.delete).toHaveBeenNthCalledWith(2, expect.objectContaining({
                'selection': 'content_id = ? AND uid = ?',
                'selectionArgs': ['SAMPLE_CONTENT_ID', 'SAMPLE_UID'],
                'table': 'learner_assessments'
            }));
            done();
        });
    });
});
