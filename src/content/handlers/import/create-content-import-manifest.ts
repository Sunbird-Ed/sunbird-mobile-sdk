import {DbService} from '../../../db';
import {ImportContentContext} from '../..';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_LOCAL_LAST_UPDATED_ON = ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON;
import COLUMN_NAME_SERVER_LAST_UPDATED_ON = ContentEntry.COLUMN_NAME_SERVER_LAST_UPDATED_ON;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;
import Queue from 'typescript-collections/dist/lib/Queue';
import LinkedList from 'typescript-collections/dist/lib/LinkedList';
import {ContentUtil} from '../../util/content-util';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {ImportNExportHandler} from '../import-n-export-handler';
import {DeviceInfo} from '../../../util/device/def/device-info';
import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import {ArrayUtil} from '../../../util/array-util';

export class CreateContentImportManifest {
    private static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private dbService: DbService,
                private deviceInfo: DeviceInfo,
                private fileService: FileService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {

        const response: Response = new Response();
        return this.findAllContentsWithIdentifiers(importContentContext.identifiers!).then(async (contentsInDb) => {
            try {
                await this.createnWriteManifest(contentsInDb);
                response.body = importContentContext;
                return Promise.resolve(response);
            } catch (e) {
                return Promise.reject(response);
            }

        });
    }

    findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const orderby = ` ORDER BY ${COLUMN_NAME_LOCAL_LAST_UPDATED_ON} DESC, ${COLUMN_NAME_SERVER_LAST_UPDATED_ON} DESC`;
        const filter = ` WHERE ${COLUMN_NAME_IDENTIFIER} IN (${identifiersStr}) AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} ${filter} ${orderby}`;
        return this.dbService.execute(query).toPromise();
    }

    private async createnWriteManifest(contentsInDb: ContentEntry.SchemaMap[]) {
        const importnExportHandler = new ImportNExportHandler(this.deviceInfo);
        for (const e of contentsInDb) {
            const contentInDb = e as ContentEntry.SchemaMap;
            const queue: Queue<ContentEntry.SchemaMap> = new Queue();
            queue.add(contentInDb);
            let node: ContentEntry.SchemaMap;
            const contentWithAllChildren: ContentEntry.SchemaMap[] = [];
            contentWithAllChildren.push(contentInDb);
            while (!queue.isEmpty()) {
                node = queue.dequeue()!;

                if (ContentUtil.hasChildren(node[COLUMN_NAME_LOCAL_DATA])) {
                    const childContentsIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(node[COLUMN_NAME_LOCAL_DATA]);
                    const contentModelListInDB: ContentEntry.SchemaMap[] = await this.findAllContentsWithIdentifiers(
                        childContentsIdentifiers);
                    if (contentModelListInDB && contentModelListInDB.length) {
                        contentModelListInDB.forEach((contentModelInDb) => {
                            queue.add(contentModelInDb);
                        });
                        contentWithAllChildren.concat(contentModelListInDB);
                    }
                }
            }
            const items: any[] = importnExportHandler.populateItems(contentWithAllChildren);
            const manifest: { [key: string]: any } = importnExportHandler.generateManifestForArchive(items);
            await this.fileService.writeFile(ContentUtil.getBasePath(contentInDb[COLUMN_NAME_PATH]!),
                CreateContentImportManifest.MANIFEST_FILE_NAME,
                JSON.stringify(manifest),
                {replace: true});
        }
    }
}
