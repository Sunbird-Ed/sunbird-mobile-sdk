import { DbService } from '../../../db';
import { Response } from '../../../api';
import { ImportTelemetryContext } from '../..';
export declare class UpdateImportedTelemetryMetadata {
    private dbService;
    constructor(dbService: DbService);
    execute(importContext: ImportTelemetryContext): Promise<Response>;
}
