import { ExportContentContext, ContentExportRequest } from '../..';
import { Response } from '../../../api';
import { TelemetryService } from '../../../telemetry';
export declare class GenerateExportShareTelemetry {
    private telemetryService;
    constructor(telemetryService: TelemetryService);
    execute(exportContentContext: ExportContentContext, fileName: string, contentExportRequest: ContentExportRequest): Promise<Response>;
}
