import { AppConfig } from '../../api/config/app-config';
import { FileService } from '../../util/file/def/file-service';
import { DbService } from '../../db';
import { DeviceInfo } from '../../util/device';
export declare class StorageHandler {
    private appConfig;
    private fileService;
    private dbService;
    private deviceInfo;
    private static MANIFEST_FILE_NAME;
    constructor(appConfig: AppConfig, fileService: FileService, dbService: DbService, deviceInfo: DeviceInfo);
    addDestinationContentInDb(identifier: string, storageFolder: string, keepLowerVersion: boolean): Promise<void>;
    private extractContentFromItem;
    deleteContentsFromDb(deletedIdentifiers: string[]): Promise<void>;
}
