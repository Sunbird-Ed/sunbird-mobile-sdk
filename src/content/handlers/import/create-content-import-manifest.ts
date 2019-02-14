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

export class CreateContentImportManifest {
    private static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private dbService: DbService,
                private deviceInfo: DeviceInfo,
                private fileService: FileService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {


        const response: Response = new Response();
        return this.findAllContentsWithIdentifiers(importContentContext.identifiers).then((contentsInDb) => {
            try {
                this.createnWriteManifest(contentsInDb);
                response.body = importContentContext;
                return Promise.resolve(response);
            } catch (e) {
                return Promise.reject(response);
            }

        });
    }

    findAllContentsWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = identifiers.join(',');
        const orderby = ` order by ${COLUMN_NAME_LOCAL_LAST_UPDATED_ON} desc, ${COLUMN_NAME_SERVER_LAST_UPDATED_ON} desc`;
        const filter = ` where ${COLUMN_NAME_IDENTIFIER} in ('${identifiersStr}') AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `select * from ${ContentEntry.TABLE_NAME} ${filter} ${orderby}`;
        return this.dbService.execute(query).toPromise();
    }

    createnWriteManifest(contentsInDb: ContentEntry.SchemaMap[]) {
        const importnExportHandler = new ImportNExportHandler(this.deviceInfo);
        contentsInDb.forEach(async (contentInDb: ContentEntry.SchemaMap) => {
            const queue: Queue<ContentEntry.SchemaMap> = new Queue();
            queue.add(contentInDb);
            let node: ContentEntry.SchemaMap;
            let contentWithAllChildren: ContentEntry.SchemaMap[] = [];
            contentWithAllChildren.push(contentInDb);
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
            const items: any[] = importnExportHandler.populateContents(contentWithAllChildren);
            const manifest: { [key: string]: any } = importnExportHandler.generateManifestForArchive(items);
            await this.fileService.writeFile(contentInDb[COLUMN_NAME_PATH],
                CreateContentImportManifest.MANIFEST_FILE_NAME,
                JSON.stringify(manifest),
                {replace: true});
        });
    }
}
