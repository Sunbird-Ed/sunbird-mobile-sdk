import { DbService } from '../../../db';
import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
import { ExportProfileContext } from '../../def/export-profile-context';
export declare class CleanupExportedFile {
    private dbService;
    private fileService;
    constructor(dbService: DbService, fileService: FileService);
    execute(exportContext: ExportProfileContext): Promise<Response>;
    private getAllTables;
    private getAllTablesToExclude;
    private removeTables;
    private populateMetaData;
    private deleteUnwantedProfilesAndUsers;
    private deleteUnwantedProfileSummary;
    private deleteUnwantedGroups;
    private deleteUnwantedGroupProfiles;
    private keepAllFrameworknChannel;
    private cleanTable;
}
