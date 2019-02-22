import { DbService } from '../../../db';
import { ExportContentContext } from '../..';
import { DeviceInfo } from '../../../util/device/def/device-info';
import { Response } from '../../../api';
export declare class CreateContentExportManifest {
    private dbService;
    private deviceInfo;
    private static readonly EKSTEP_CONTENT_ARCHIVE;
    private static readonly SUPPORTED_MANIFEST_VERSION;
    constructor(dbService: DbService, deviceInfo: DeviceInfo);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
