import { FileService } from './../../../util/file/def/file-service';
import { Response } from '../../../api';
import { DbService } from '../../../db';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../../util/shared-preferences';
export declare class UpdateSizeOnDevice {
    private dbService;
    private sharedPreferences;
    private fileService;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences, fileService: FileService);
    execute(): Promise<Response>;
    private findAllChildContents;
    updateAllRootContentSize(): Observable<any>;
    private getSizeOnDevice;
    private updateInDb;
    private getMetaData;
    private updateTextBookSize;
}
