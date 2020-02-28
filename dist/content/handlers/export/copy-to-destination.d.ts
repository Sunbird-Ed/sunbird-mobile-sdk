import { Response } from '../../../api';
import { ContentExportRequest } from '../..';
export declare class CopyToDestination {
    constructor();
    execute(exportResponse: Response, contentExportRequest: ContentExportRequest): Promise<Response>;
}
