import { ExportContentContext } from '../..';
import { Response } from '../../../api';
import { TelemetryService } from '../../../telemetry';
export declare class GenerateExportShareTelemetry {
    private telemetryService;
    constructor(telemetryService: TelemetryService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
