import { ContentAccessEntry } from '../../content/db/schema';
import { ContentAccess } from '..';
export declare class ProfileHandler {
    static mapDBEntryToContenetAccess(contentAccess: ContentAccessEntry.SchemaMap): ContentAccess;
}
