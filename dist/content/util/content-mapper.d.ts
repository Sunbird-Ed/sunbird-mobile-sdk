import { ContentEntry } from '../db/schema';
import { Content } from '..';
export declare class ContentMapper {
    static mapContentDataToContentDBEntry(contentData: any, manifestVersion: string): ContentEntry.SchemaMap;
    static mapServerResponseToContent(contentData: any, manifestVersion?: string): Content;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, shouldConvertBasePath?: boolean): Content;
}
