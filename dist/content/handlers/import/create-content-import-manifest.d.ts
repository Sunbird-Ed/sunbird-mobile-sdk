import { DbService } from '../../../db';
import { ImportContentContext } from '../..';
import { ContentEntry } from '../../db/schema';
import { DeviceInfo } from '../../../util/device/def/device-info';
import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
export declare class CreateContentImportManifest {
    private dbService;
    private deviceInfo;
    private fileService;
    private static readonly MANIFEST_FILE_NAME;
    constructor(dbService: DbService, deviceInfo: DeviceInfo, fileService: FileService);
    execute(importContentContext: ImportContentContext): Promise<Response>;
    findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]>;
    private createnWriteManifest;
}
