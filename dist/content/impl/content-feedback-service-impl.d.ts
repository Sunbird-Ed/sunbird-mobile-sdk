import { ContentFeedbackService } from '../def/content-feedback-service';
import { ContentFeedback, ContentFeedbackFilterCriteria } from '..';
import { Observable } from 'rxjs';
import { DbService } from '../../db';
import { ProfileService } from '../../profile';
export declare class ContentFeedbackServiceImpl implements ContentFeedbackService {
    private dbService;
    private profileService;
    constructor(dbService: DbService, profileService: ProfileService);
    getFeedback(contentFeedbackFilterCriteria: ContentFeedbackFilterCriteria): Observable<ContentFeedback[]>;
    sendFeedback(contentFeedback: ContentFeedback): Observable<any>;
}
