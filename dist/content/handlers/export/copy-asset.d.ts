import { ExportContentContext } from '../..';
import { Response } from '../../../api';
export declare class CopyAsset {
    constructor();
    execute(exportContentContext: ExportContentContext): Promise<Response>;
    private excludeContentForSubModule;
    private copyFile;
}
