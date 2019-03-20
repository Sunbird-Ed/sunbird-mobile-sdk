import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
import { FileService } from '../../util/file/def/file-service';
import { SharedPreferences } from '../../util/shared-preferences';
import { ZipService } from '../../util/zip/def/zip-service';
export declare class DeleteContentHandler {
    private dbService;
    private fileService;
    private sharedPreferences;
    private zipService;
    constructor(dbService: DbService, fileService: FileService, sharedPreferences: SharedPreferences, zipService: ZipService);
    deleteAllChildren(row: ContentEntry.SchemaMap, isChildContent: boolean): Promise<void>;
    deleteOrUpdateContent(contentInDb: ContentEntry.SchemaMap, isChildItems: boolean, isChildContent: boolean): Promise<void>;
    private updateLastModifiedTime;
    findAllContentsFromDbWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]>;
    /** @internal */
    private rm;
}
