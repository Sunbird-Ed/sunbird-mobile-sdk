import { DbService } from '../../../db';
import { ImportTelemetryContext } from '../..';
import { Response } from '../../../api';
export declare class TransportProcessedTelemetry {
    private dbService;
    constructor(dbService: DbService);
    execute(importContext: ImportTelemetryContext): Promise<Response>;
    private saveProccessedTelemetryToDB;
}
