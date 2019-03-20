import { ExportTelemetryContext } from '../..';
import { Response } from '../../../api';
import { DbService } from '../../../db';
export declare class CopyDatabase {
    private dbService;
    constructor(dbService: DbService);
    execute(exportContext: ExportTelemetryContext): Promise<Response>;
}
