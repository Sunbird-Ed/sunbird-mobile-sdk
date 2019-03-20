import { ContentFeedback, ContentFeedbackFilterCriteria, ContentFeedbackService } from '..';
import { Observable } from 'rxjs';
import { DbService } from '../../db';
import { ProfileService } from '../../profile';
import { TelemetryService } from '../../telemetry';
export declare class ContentFeedbackServiceImpl implements ContentFeedbackService {
    private dbService;
    private profileService;
    private telemetryService;
    constructor(dbService: DbService, profileService: ProfileService, telemetryService: TelemetryService);
    getFeedback(contentFeedbackFilterCriteria: ContentFeedbackFilterCriteria): Observable<ContentFeedback[]>;
    sendFeedback(contentFeedback: ContentFeedback): Observable<boolean>;
}
