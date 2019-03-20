import { DbService } from '../../../db';
import { ExportContentContext } from '../..';
import { Response } from '../../../api';
import { ImportNExportHandler } from '../import-n-export-handler';
export declare class CreateContentExportManifest {
    private dbService;
    private exportHandler;
    private static readonly EKSTEP_CONTENT_ARCHIVE;
    private static readonly SUPPORTED_MANIFEST_VERSION;
    constructor(dbService: DbService, exportHandler: ImportNExportHandler);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
