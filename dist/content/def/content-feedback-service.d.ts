import { Observable } from 'rxjs';
import { ContentFeedback, ContentFeedbackFilterCriteria } from './content';
export interface ContentFeedbackService {
    /**
     * This api is used to save the feedback about content.
     *
     * @param contentFeedback - {@link ContentFeedback}
     */
    sendFeedback(contentFeedback: ContentFeedback): Observable<boolean>;
    /**
     * This api is used to get the feedback about a content.
     * <p>
     * <p>On successful fetching the data, the response will return
     * status as TRUE and with result type as {@link ContentFeedback}, if content has any feedback then the result will not be null,
     * <p>
     * On failing to fetch the data, the response will return status as FALSE with the following error.
     *
     * @param contentFeedbackFilterCriteria - {@link ContentFeedbackFilterCriteria}
     */
    getFeedback(contentFeedbackFilterCriteria: ContentFeedbackFilterCriteria): Observable<ContentFeedback[]>;
}
