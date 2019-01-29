import { ContentEntry } from '../db/schema';
import { Content, ContentData } from './content';
export declare class CotentMapper {
    static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap): Content;
}
