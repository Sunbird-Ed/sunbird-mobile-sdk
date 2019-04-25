import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
import { FileService } from '../../util/file/def/file-service';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class DeleteContentHandler {
    private dbService;
    private fileService;
    private sharedPreferences;
    private updateNewContentModels;
    private fileMapList;
    constructor(dbService: DbService, fileService: FileService, sharedPreferences: SharedPreferences);
    deleteAllChildren(row: ContentEntry.SchemaMap, isChildContent: boolean): Promise<void>;
    deleteOrUpdateContent(contentInDb: ContentEntry.SchemaMap, isChildItems: boolean, isChildContent: boolean): Promise<void>;
    private findAllContentsFromDbWithIdentifiers;
    /** @internal */
    private rm;
    private getMetaData;
}
