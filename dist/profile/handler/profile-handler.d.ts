import { ContentAccessEntry } from '../../content/db/schema';
import { ContentAccess } from '../def/content-access';
export declare class ProfileHandler {
    static mapDBEntryToContenetAccess(contentAccess: ContentAccessEntry.SchemaMap): ContentAccess;
}
