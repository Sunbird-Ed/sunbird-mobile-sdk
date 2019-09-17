import { Response } from '../../../api';
import { DbService } from '../../../db';
import { SharedPreferences } from '../../../util/shared-preferences';
export declare class UpdateSizeOnDevice {
    private dbService;
    private sharedPreferences;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences);
    execute(): Promise<Response>;
    private findAllContents;
    private findAllChildContents;
    private updateSize;
    private getSizeOnDevice;
    private updateInDb;
    private getMetaData;
}
