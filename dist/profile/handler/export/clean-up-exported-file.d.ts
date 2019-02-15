import { ExportProfileContext } from '../../def/profile-export-request';
import { DbService } from '../../../db';
export declare class CleanUpExportedFile {
    private dbService;
    constructor(dbService: DbService);
    execute(profileExportContext: ExportProfileContext): void;
    getAllTablesToExclude(): string[];
    getAllTables(): Promise<string[]>;
    dropTables(allTables: string[], allTablesToExclude: string[]): void;
    cleanTable(tableName: string): Promise<any>;
    deleteUnWantedProfilesAndUsers(userIds: string[]): void;
    deleteUnwantedGroupProfileMapping(groupIds: string[]): void;
    keepAllFrameworkAndChannel(): Promise<any>;
}
