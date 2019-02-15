import { ContentEntry } from '../db/schema';
import { DeviceInfo } from '../../util/device/def/device-info';
export declare class ImportNExportHandler {
    private deviceInfo;
    private static readonly EKSTEP_CONTENT_ARCHIVE;
    private static readonly SUPPORTED_MANIFEST_VERSION;
    constructor(deviceInfo: DeviceInfo);
    populateContents(contentsInDb: ContentEntry.SchemaMap[]): any[];
    generateManifestForArchive(items: any[]): {
        [key: string]: any;
    };
}
