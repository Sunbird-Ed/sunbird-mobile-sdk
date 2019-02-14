import {DbService} from '../../../db';
import {ExportContentContext} from '../..';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {ContentUtil} from '../../util/content-util';
import {DeviceInfo} from '../../../util/device/def/device-info';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import {Visibility} from '../../util/content-constants';
import moment from 'moment';

export class CreateContentExportManifest {

    private static readonly EKSTEP_CONTENT_ARCHIVE = 'ekstep.content.archive';
    private static readonly SUPPORTED_MANIFEST_VERSION = '1.1';

    constructor(private dbService: DbService,
                private deviceInfo: DeviceInfo) {
    }

    execute(exportContentContext: ExportContentContext): Promise<ExportContentContext> {
        const allContentsIdentifier: string[] = [];
        let childIdentifiers: string[] = [];
        const contentIndex: { [key: string]: any } = {};
        exportContentContext.contentModelsToExport.forEach((contentInDb) => {
            // item local data
            const item = JSON.parse(contentInDb[COLUMN_NAME_LOCAL_DATA]);
            // index item
            contentIndex.contentInDb[COLUMN_NAME_IDENTIFIER] = item;
            ContentUtil.addViralityMetadataIfMissing(item, this.deviceInfo.getDeviceID());
            // get item's children only to mark children with visibility as Parent
            if (ContentUtil.hasChildren(item)) {
                // store children identifiers
                const childContentIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(item);
                childIdentifiers = {...childIdentifiers, ...childContentIdentifiers};
            }

            allContentsIdentifier.push(contentInDb[COLUMN_NAME_IDENTIFIER]);
        });
        allContentsIdentifier.forEach((identifier) => {
            const contentData = contentIndex[identifier];
            if (childIdentifiers.indexOf(identifier) !== -1) {
                contentData['visibility'] = Visibility.PARENT.valueOf();
            }
            exportContentContext.items.push(contentData);
        });

        const archive: { [key: string]: any } = {};
        archive.ttl = 24;
        archive.count = exportContentContext.items.length;
        archive.items = exportContentContext.items;

        // Initialize manifest
        exportContentContext.manifest['id'] = CreateContentExportManifest.EKSTEP_CONTENT_ARCHIVE;
        exportContentContext.manifest['ver'] = CreateContentExportManifest.SUPPORTED_MANIFEST_VERSION;
        exportContentContext.manifest['ts'] = moment().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        exportContentContext.manifest['archive'] = archive;
        return Promise.resolve(exportContentContext);
    }

}
