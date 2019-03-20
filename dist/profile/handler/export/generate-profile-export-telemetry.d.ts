import { Response } from '../../../api';
import { DbService } from '../../../db';
import { ImportTelemetryContext } from '../../../telemetry';
export declare class GenerateProfileExportTelemetry {
    private dbService;
    constructor(dbService: DbService);
    execute(importContext: ImportTelemetryContext): Promise<Response>;
}
