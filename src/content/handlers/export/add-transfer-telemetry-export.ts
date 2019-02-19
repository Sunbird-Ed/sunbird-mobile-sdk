import {ExportContentContext} from '../..';
import {Response} from '../../../api';

export class AddTransferTelemetryExport {
    constructor() {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        response.body = exportContentContext;
        return Promise.resolve(response);
    }


}
