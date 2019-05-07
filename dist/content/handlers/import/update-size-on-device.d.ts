import { Response } from '../../../api';
import { DbService } from '../../../db';
export declare class UpdateSizeOnDevice {
    private dbService;
    constructor(dbService: DbService);
    execute(): Promise<Response>;
    private findAllContents;
    private findAllChildContents;
    private updateSize;
    private getSizeOnDevice;
    private updateInDb;
    private getMetaData;
}
