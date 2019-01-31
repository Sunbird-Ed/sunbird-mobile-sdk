import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
export declare class DeleteContentHandler {
    private dbService;
    constructor(dbService: DbService);
    deleteAllPreRequisites(row: ContentEntry.SchemaMap, isChildContent: boolean): Promise<void>;
    deleteAllChildren(row: ContentEntry.SchemaMap, isChildContent: boolean): Promise<void>;
    deleteOrUpdateContent(contentInDb: ContentEntry.SchemaMap, isChildItems: boolean, isChildContent: boolean): Promise<boolean>;
    private updateContentInDB;
    findAllContentsFromDbWithIdentifiers(childContentsIdentifiers: string[]): Promise<ContentEntry.SchemaMap[]>;
}
