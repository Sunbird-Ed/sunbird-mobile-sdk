import { ContentEntry } from '../db/schema';
import { Content, ContentData } from '..';
export declare class ContentMapper {
    static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap): Content;
}
