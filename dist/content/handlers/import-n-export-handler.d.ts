import { ContentEntry } from '../db/schema';
import { DeviceInfo } from '../../util/device/def/device-info';
import { DbService } from '../../db';
export declare class ImportNExportHandler {
    private deviceInfo;
    private dbService?;
    private static readonly EKSTEP_CONTENT_ARCHIVE;
    private static readonly SUPPORTED_MANIFEST_VERSION;
    constructor(deviceInfo: DeviceInfo, dbService?: DbService | undefined);
    populateContents(contentsInDb: ContentEntry.SchemaMap[]): any[];
    getContentExportDBModeltoExport(contentIds: string[]): Promise<ContentEntry.SchemaMap[]>;
    generateManifestForArchive(items: any[]): {
        [key: string]: any;
    };
    findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]>;
}
