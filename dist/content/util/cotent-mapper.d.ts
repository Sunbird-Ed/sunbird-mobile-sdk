import { ContentEntry } from '../db/schema';
import { Content, ContentData } from '../def/content';
export declare class CotentMapper {
    static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap): Content;
}
