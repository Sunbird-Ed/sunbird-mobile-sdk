import { ContentFeedback } from '..';
import { ContentFeedbackEntry } from '../db/schema';
export declare class ContentFeedbackHandler {
    static mapFeedbackDBEntrytoResponseFeedback(feedback: ContentFeedbackEntry.SchemaMap): ContentFeedback;
}
