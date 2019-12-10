import { ContentEntry } from '../db/schema';
import { DbService } from '../../db';
import { FileService } from '../../util/file/def/file-service';
import { DeviceInfo } from '../../util/device';
export declare class ImportNExportHandler {
    private deviceInfo;
    private dbService?;
    private fileService?;
    private static readonly EKSTEP_CONTENT_ARCHIVE;
    private static readonly SUPPORTED_MANIFEST_VERSION;
    constructor(deviceInfo: DeviceInfo, dbService?: DbService | undefined, fileService?: FileService | undefined);
    populateItems(contentsInDb: ContentEntry.SchemaMap[]): {
        [key: string]: any;
    }[];
    populateItemList(contentWithAllChildren: {
        [key: string]: any;
    }[]): {
        [key: string]: any;
    }[];
    getContentExportDBModelToExport(contentIds: string[]): Promise<ContentEntry.SchemaMap[]>;
    generateManifestForArchive(items: any[]): {
        [key: string]: any;
    };
    private findAllContentsWithIdentifiers;
}
