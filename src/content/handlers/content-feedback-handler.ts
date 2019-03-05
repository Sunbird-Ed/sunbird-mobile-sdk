import {ProfileEntry} from '../../profile/db/schema';
import {Profile, ProfileSource, ProfileType} from '../../profile';
import {ContentFeedback} from '..';
import {ContentFeedbackEntry} from '../db/schema';

export class ContentFeedbackHandler {
    public static mapFeedbackDBEntrytoResponseFeedback(feedback: ContentFeedbackEntry.SchemaMap): ContentFeedback {
        return {
            contentId: feedback[ContentFeedbackEntry.COLUMN_NAME_CONTENT_ID],
            rating: Number(feedback[ContentFeedbackEntry.COLUMN_NAME_RATING]),
            comments: feedback[ContentFeedbackEntry.COLUMN_NAME_COMMENTS],
            createdAt: Number(feedback[ContentFeedbackEntry.COLUMN_NAME_CREATED_AT]),
            stageId: '',
            contentVersion: ''
        };
    }
}
