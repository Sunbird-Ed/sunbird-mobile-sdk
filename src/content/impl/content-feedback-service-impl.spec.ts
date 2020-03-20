import { ContentFeedbackService } from '..';
import { InjectionTokens } from '../../injection-tokens';
import { Container } from 'inversify';
import { ContentFeedbackServiceImpl } from './content-feedback-service-impl';
import { DbService, ProfileService, ContentFeedbackFilterCriteria, ContentFeedback } from '../..';
import { TelemetryService } from '../../telemetry';
import { Observable, of } from 'rxjs';

describe('ContentFeedbackServiceImpl', () => {
    let contentFeedbackService: ContentFeedbackService;

    const container = new Container();
    const mockDbService: Partial<DbService> = {};
    const mockProfileService: Partial<ProfileService> = {
        getActiveProfileSession: jest.fn().mockImplementation(() => {})
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        feedback: jest.fn().mockImplementation(() => {})
    };

    beforeAll(() => {
        container.bind<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE).to(ContentFeedbackServiceImpl);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).toConstantValue(mockTelemetryService as TelemetryService);

        contentFeedbackService = container.get(InjectionTokens.CONTENT_FEEDBACK_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of ApiServiceImpl from container', () => {
        expect(contentFeedbackService).toBeTruthy();
    });

    it('should return content feedback DBEntry to responseFeedback', (done) => {
        // arrange
        const request: ContentFeedbackFilterCriteria = {
            uid: 'SAMPLE_UID',
            contentId: 'SAMPLE_CONTENT_ID'
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        // act
         contentFeedbackService.getFeedback(request).subscribe(() => {
             // assert
             expect(mockDbService.execute).toHaveBeenCalled();
             done();
         });
        // assert
    });

    it('should checked feedback send or not', (done) => {
        // arrange
        const request: ContentFeedback = {
            contentId: 'SAMPLE_CONTENT_ID',
            rating: 5,
            comments: 'SAMPLE_COMMENTS',
            contentVersion: 'SAMPLE_CONTENT_VERSION'
        };
        (mockProfileService.getActiveProfileSession as jest.Mock).mockReturnValue(of([]));
        (mockTelemetryService.feedback as jest.Mock).mockReturnValue(of([]));
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        mockDbService.insert = jest.fn().mockImplementation(() => of([]));
        // act
        contentFeedbackService.sendFeedback(request).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
            done();
        });
    });
});

