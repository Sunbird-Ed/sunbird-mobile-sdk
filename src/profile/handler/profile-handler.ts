import {ContentAccessEntry} from '../../content/db/schema';
import {ContentAccess} from '..';

export class ProfileHandler {
    public static mapDBEntryToContenetAccess(contentAccess: ContentAccessEntry.SchemaMap): ContentAccess {
        const learnerState = contentAccess[ContentAccessEntry.COLUMN_NAME_LEARNER_STATE];
        return {
            status: Number(contentAccess[ContentAccessEntry.COLUMN_NAME_STATUS]),
            contentId: contentAccess[ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER],
            contentType: contentAccess[ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE],
            contentLearnerState: {learnerState: learnerState && JSON.parse(learnerState)}
        };
    }
}
