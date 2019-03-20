import { DbService } from '../../../db';
import { ExportTelemetryContext } from '../..';
import { Response } from '../../../api';
export declare class CleanCurrentDatabase {
    private dbService;
    constructor(dbService: DbService);
    execute(exportContext: ExportTelemetryContext): Promise<Response>;
}
