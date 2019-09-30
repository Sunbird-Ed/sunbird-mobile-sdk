import {ContentEntry} from '../db/schema';
import Queue from 'typescript-collections/dist/lib/Queue';
import {ContentUtil} from '../util/content-util';
import {Visibility} from '../util/content-constants';
import {DeviceInfo} from '../../util/device/def/device-info';
import * as moment from 'moment';
import {DbService} from '../../db';
import {ArrayUtil} from '../../util/array-util';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;

export class ImportNExportHandler {
    private static readonly EKSTEP_CONTENT_ARCHIVE = 'ekstep.content.archive';
    private static readonly SUPPORTED_MANIFEST_VERSION = '1.1';

    constructor(private deviceInfo: DeviceInfo,
                private dbService?: DbService) {

    }

    populateItems(contentsInDb: ContentEntry.SchemaMap[]): { [key: string]: any }[] {
        const items: any[] = [];
        const allContentsIdentifier: string[] = [];
        let childIdentifiers: string[] = [];
        const contentIndex: { [key: string]: any } = {};
        contentsInDb.forEach((contentInDb) => {
            // item local data
            const item = JSON.parse(contentInDb[COLUMN_NAME_LOCAL_DATA]);
            // index item
            contentIndex[contentInDb[COLUMN_NAME_IDENTIFIER]] = item;
            ContentUtil.addViralityMetadataIfMissing(item, this.deviceInfo!.getDeviceID());
            // get item's children only to mark children with visibility as Parent
            if (ContentUtil.hasChildren(item)) {
                // store children identifiers
                const childContentIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(item);
                childIdentifiers = childIdentifiers.concat(childContentIdentifiers);
            }

            allContentsIdentifier.push(contentInDb[COLUMN_NAME_IDENTIFIER]);
        });
        try {
            allContentsIdentifier.forEach((identifier) => {
                const contentData = contentIndex[identifier];
                if (ArrayUtil.contains(childIdentifiers, identifier)) {
                    contentData['visibility'] = Visibility.PARENT.valueOf();
                }
                items.push(contentData);
            });
        } catch (e) {
            console.log(e);
        }


        return items;
    }

    populateItemList(contentWithAllChildren: { [key: string]: any }[]): { [key: string]: any }[] {
        const items: any[] = [];
        const allContentsIdentifier: string[] = [];
        let childIdentifiers: string[] = [];
        const contentIndex: { [key: string]: any } = {};
        contentWithAllChildren.forEach((item) => {
            contentIndex[item['identifier']] = item;
            ContentUtil.addViralityMetadataIfMissing(item, this.deviceInfo!.getDeviceID());
            // get item's children only to mark children with visibility as Parent
            if (ContentUtil.hasChildren(item)) {
                // store children identifiers
                const childContentIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(item);
                childIdentifiers = childIdentifiers.concat(childContentIdentifiers);
            }

            allContentsIdentifier.push(item['identifier']);
        });
        try {
            allContentsIdentifier.forEach((identifier) => {
                const contentData = contentIndex[identifier];
                if (ArrayUtil.contains(childIdentifiers, identifier)) {
                    contentData['visibility'] = Visibility.PARENT.valueOf();
                }
                items.push(contentData);
            });
        } catch (e) {
            console.log(e);
        }

        return items;
    }

    public async getContentExportDBModelToExport(contentIds: string[]): Promise<ContentEntry.SchemaMap[]> {
        const contentModelToExport: ContentEntry.SchemaMap[] = [];
        const queue: Queue<ContentEntry.SchemaMap> = new Queue();

        const contentsInDb: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(contentIds);
        contentsInDb.forEach((contentInDb) => {
            queue.add(contentInDb);
        });
        let node: ContentEntry.SchemaMap;
        while (!queue.isEmpty()) {
            node = queue.dequeue()!;
            if (ContentUtil.hasChildren(node[ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                const childContentsIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(node[COLUMN_NAME_LOCAL_DATA]);
                const contentModelListInDB: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(
                    childContentsIdentifiers);
                if (contentModelListInDB && contentModelListInDB.length > 0) {
                    contentModelListInDB.forEach((contentModelInDb) => {
                        queue.add(contentModelInDb);
                    });
                }
            }
            contentModelToExport.push(node);
        }
        return Promise.resolve(ContentUtil.deDupe(contentModelToExport, 'identifier'));
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
        manifest['ts'] = moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss[Z]');
        manifest['archive'] = archive;
        return manifest;
    }

    private findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const filter = ` where ${COLUMN_NAME_IDENTIFIER} in (${identifiersStr}) AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `select * from ${ContentEntry.TABLE_NAME} ${filter}`;
        return this.dbService!.execute(query).toPromise();
    }
}
