import {ProfileEntry} from '../db/schema';
import {Profile, ProfileSource, ProfileType} from '..';
import {ContentAccessEntry} from '../../content/db/schema';
import {ContentAccess} from '../def/content-access';

export class ProfileHandler {
    public static mapDBEntryToContenetAccess(contentAccess: ContentAccessEntry.SchemaMap): ContentAccess {
        return {
            status: Number(contentAccess[ContentAccessEntry.COLUMN_NAME_STATUS]),
            contentId: contentAccess[ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER],
            contentType: contentAccess[ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE],
            contentLearnerState: {learnerState: JSON.parse(contentAccess[ContentAccessEntry.COLUMN_NAME_LEARNER_STATE])}
        };
    }
}
