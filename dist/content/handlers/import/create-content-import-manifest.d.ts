import { DbService } from '../../../db';
import { ImportContentContext } from '../..';
import { DeviceInfo } from '../../../util/device';
import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
export declare class CreateContentImportManifest {
    private dbService;
    private deviceInfo;
    private fileService;
    private contentDataMap;
    constructor(dbService: DbService, deviceInfo: DeviceInfo, fileService: FileService);
    execute(importContentContext: ImportContentContext): Promise<Response>;
    private createnWriteManifest;
    private writeFile;
}
