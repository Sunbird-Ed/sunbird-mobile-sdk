import { DbService } from '../../../db';
import { FileService } from '../../../util/file/def/file-service';
import { ExportTelemetryContext } from '../..';
import { Response } from '../../../api';
export declare class CleanupExportedFile {
    private dbService;
    private fileService;
    constructor(dbService: DbService, fileService: FileService);
    execute(exportContext: ExportTelemetryContext): Promise<Response>;
    private getAllTables;
    private getAllTablesToExclude;
    private removeTables;
    private populateMetaData;
}
