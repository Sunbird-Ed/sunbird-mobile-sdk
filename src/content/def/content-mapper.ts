import {ContentEntry} from '../db/schema';
import {Content, ContentData} from './content';
import {Observable} from 'rxjs';

export class ContentMapper {
    public static mapContentDataToContentDBEntry(contentData: ContentData): Observable<ContentEntry.SchemaMap> {
        // TODO Swajanjit
        throw new Error('Not Implemented');
    }

    public static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap): Observable<Content> {
        // TODO Swajanjit
        throw new Error('Not Implemented');
    }
}
