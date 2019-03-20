import { TelemetryService } from '../../../telemetry';
import { ImportContentContext } from '../..';
import { Response } from '../../../api';
export declare class GenerateInteractTelemetry {
    private telemetryService;
    constructor(telemetryService: TelemetryService);
    execute(importContext: ImportContentContext, subType: any): Promise<Response>;
}
