import {ContentEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import * as dayjs from 'dayjs';
import {DbService} from '../../db';
import {ArrayUtil} from '../../util/array-util';
import {FileService} from '../../util/file/def/file-service';
import {DeviceInfo} from '../../util/device';
import {FileName, Visibility} from '..';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;

export class ImportNExportHandler {
    private static readonly EKSTEP_CONTENT_ARCHIVE = 'ekstep.content.archive';
    private static readonly SUPPORTED_MANIFEST_VERSION = '1.1';

    constructor(private deviceInfo: DeviceInfo,
                private dbService?: DbService,
                private fileService?: FileService
    ) {

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
        let contentModelToExport: ContentEntry.SchemaMap[] = [];
        // const queue: Queue<ContentEntry.SchemaMap> = new Queue();
        const contentsInDb: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(contentIds);
        let path = contentsInDb[0][ContentEntry.COLUMN_NAME_PATH]!
        const manifestPath = ContentUtil.getBasePath(path);
        await this.fileService!.readAsText(manifestPath, FileName.MANIFEST.valueOf())
            .then(async (fileContents) => {
                const childContents = JSON.parse(fileContents).archive.items;
                const childIdentifiers: string[] = [];
                childContents.forEach(element => {
                    childIdentifiers.push(element.identifier);
                });
                contentModelToExport = await this.findAllContentsWithIdentifiers(childIdentifiers, true);
            }).catch((err) => {
                console.log('fileRead error', err);
            });
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
        manifest['ts'] = dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]');
        manifest['archive'] = archive;
        return manifest;
    }

    private findAllContentsWithIdentifiers(identifiers: string[], sort?): Promise<ContentEntry.SchemaMap[]> {
        let orderByString = '';
        if (sort) {
            if (identifiers.length) {
                orderByString = identifiers.reduce((acc, identifier, index) => {
                    return acc + ` WHEN '${identifier}' THEN ${index}`;
                }, ` ORDER BY CASE ${COLUMN_NAME_IDENTIFIER}`) + ' END';
            }
        }

        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const filter = ` where ${COLUMN_NAME_IDENTIFIER} in (${identifiersStr}) AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `select * from ${ContentEntry.TABLE_NAME} ${filter} ${orderByString}`;
        return this.dbService!.execute(query).toPromise();
    }
}
