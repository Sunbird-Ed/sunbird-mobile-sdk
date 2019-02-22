import { ExportContentContext } from '../..';
import { Response } from '../../../api';
export declare class AddTransferTelemetryExport {
    constructor();
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
