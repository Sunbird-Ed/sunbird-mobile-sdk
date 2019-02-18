import {ContentEntry} from '../db/schema';
import Queue from 'typescript-collections/dist/lib/Queue';
import {ContentUtil} from '../util/content-util';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {Visibility} from '../util/content-constants';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import {DeviceInfo} from '../../util/device/def/device-info';
import moment from 'moment';
import {FileService} from '../../util/file/def/file-service';
import COLUMN_NAME_LOCAL_LAST_UPDATED_ON = ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON;
import COLUMN_NAME_SERVER_LAST_UPDATED_ON = ContentEntry.COLUMN_NAME_SERVER_LAST_UPDATED_ON;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;
import {DbService} from '../../db';
import {Observable} from 'rxjs';

export class ImportNExportHandler {
    private static readonly EKSTEP_CONTENT_ARCHIVE = 'ekstep.content.archive';
    private static readonly SUPPORTED_MANIFEST_VERSION = '1.1';

    constructor(private deviceInfo: DeviceInfo,
                private dbService?: DbService) {

    }

    populateContents(contentsInDb: ContentEntry.SchemaMap[]): any[] {
        const items: any[] = [];
        const allContentsIdentifier: string[] = [];
        let childIdentifiers: string[] = [];
        const contentIndex: { [key: string]: any } = {};
        contentsInDb.forEach((contentInDb) => {
            // item local data
            const item = JSON.parse(contentInDb[COLUMN_NAME_LOCAL_DATA]);
            // index item
            contentIndex.contentInDb[COLUMN_NAME_IDENTIFIER] = item;
            ContentUtil.addViralityMetadataIfMissing(item, this.deviceInfo!.getDeviceID());
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
            items.push(contentData);
        });

        return items;
    }

    async getContentExportDBModeltoExport(contentIds: string[]): Promise<ContentEntry.SchemaMap[]> {
        const queue: Queue<ContentEntry.SchemaMap> = new Queue();

        let contentWithAllChildren: ContentEntry.SchemaMap[] = [];
        const contentsInDb: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(contentIds);
        contentsInDb.forEach((contentInDb) => {
            queue.add(contentInDb);
        });
        let node: ContentEntry.SchemaMap;
        while (!queue.isEmpty()) {
            node = queue.dequeue()!;
            if (ContentUtil.hasChildren(node[COLUMN_NAME_LOCAL_DATA])) {
                const childContentsIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(node[COLUMN_NAME_LOCAL_DATA]);
                const contentModelListInDB: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(
                    childContentsIdentifiers);
                if (contentModelListInDB) {
                    contentModelListInDB.forEach((contentModelInDb) => {
                        queue.add(contentModelInDb);
                    });
                    contentWithAllChildren = {...contentWithAllChildren, ...contentModelListInDB};
                }
            }
        }
        return Promise.resolve(ContentUtil.deDupe(contentWithAllChildren, 'identifier'));
    }

    generateManifestForArchive(items: any[]): { [key: string]: any } {
        const manifest: { [key: string]: any } = {};
        const archive: { [key: string]: any } = {};
        archive.ttl = 24;
        archive.count = items.length;
        archive.items = items;

        // Initialize manifest
        manifest['id'] = ImportNExportHandler.EKSTEP_CONTENT_ARCHIVE;
        manifest['ver'] = ImportNExportHandler.SUPPORTED_MANIFEST_VERSION;
        manifest['ts'] = moment().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        manifest['archive'] = archive;
        return manifest;
    }

    findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = identifiers.join(',');
        const orderby = ` order by ${COLUMN_NAME_LOCAL_LAST_UPDATED_ON} desc, ${COLUMN_NAME_SERVER_LAST_UPDATED_ON} desc`;
        const filter = ` where ${COLUMN_NAME_IDENTIFIER} in ('${identifiersStr}') AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `select * from ${ContentEntry.TABLE_NAME} ${filter} ${orderby}`;
        return this.dbService!.execute(query).toPromise();
    }
}
