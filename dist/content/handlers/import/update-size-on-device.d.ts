import { Response } from '../../../api';
import { DbService } from '../../../db';
import { SharedPreferences } from '../../../util/shared-preferences';
export declare class UpdateSizeOnDevice {
    private dbService;
    private sharedPreferences;
    private static readonly KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences);
    execute(): Promise<Response>;
    private findAllContents;
    private findAllChildContents;
    private updateSize;
    private getSizeOnDevice;
    private updateInDb;
    private getMetaData;
}
