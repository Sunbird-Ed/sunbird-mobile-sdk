import { Response } from '../../../api';
import { ExportContentContext } from '../..';
export declare class DeleteTempDir {
    constructor();
    execute(exportContext: ExportContentContext): Promise<Response>;
}
