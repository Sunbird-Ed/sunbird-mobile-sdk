import { ImportContentContext } from '../..';
import { Response } from '../../../api';
import { TelemetryService } from '../../../telemetry';
export declare class GenerateImportShareTelemetry {
    private telemetryService;
    constructor(telemetryService: TelemetryService);
    execute(importContentContext: ImportContentContext): Promise<Response>;
}
