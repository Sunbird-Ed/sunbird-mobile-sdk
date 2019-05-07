import {ImportContentContext, Visibility} from '../..';
import {Response} from '../../../api';
import {DbService} from '../../../db';
import {ContentEntry} from '../../db/schema';
import {Observable} from 'rxjs';
import {ContentUtil} from '../../util/content-util';
import {MimeType} from '../../util/content-constants';
import Queue from 'typescript-collections/dist/lib/Queue';
import {ArrayUtil} from '../../../util/array-util';

export class UpdateSizeOnDevice {

    constructor(private dbService: DbService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        response.body = importContentContext;
        return this.updateSize().toPromise();
    }

    private findAllContents(): Observable<ContentEntry.SchemaMap[]> {
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} WHERE ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
        return this.dbService.execute(query);
    }

    private findAllChildContents(childIdentifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME}
                       WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER} IN (${ArrayUtil.joinPreservingQuotes(childIdentifiers)})
                       AND ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
        return this.dbService.execute(query).toPromise();
    }

    private updateSize(): Observable<any> {
        return this.findAllContents().mergeMap(async (contentsInDb: ContentEntry.SchemaMap[]) => {
            for (const element of contentsInDb) {
                const contentInDb = element as ContentEntry.SchemaMap;
                if (ContentUtil.hasChildren(contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                    let sizeOnDevice = 0;
                    const queue: Queue<ContentEntry.SchemaMap> = new Queue();
                    queue.add(contentInDb);
                    let node: ContentEntry.SchemaMap;
                    while (!queue.isEmpty()) {
                        node = queue.dequeue()!;
                        if (ContentUtil.hasChildren(node[ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                            const childContentsIdentifiers: string[] =
                                ContentUtil.getChildContentsIdentifiers(node[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                            const childContentsInDb: ContentEntry.SchemaMap[] = await this.findAllChildContents(childContentsIdentifiers);
                            childContentsInDb.forEach((childContentInDb) => {
                                queue.add(childContentInDb);
                            });

                        }
                        sizeOnDevice = sizeOnDevice + await this.getSizeOnDevice(node);
                    }
                    contentInDb[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] = sizeOnDevice;
                }
            }
            this.updateInDb(contentsInDb);
        });

    }

    private async getSizeOnDevice(node): Promise<number> {
        let size = 0;
        if (node[ContentEntry.COLUMN_NAME_MIME_TYPE] === MimeType.COLLECTION.valueOf()) {
            if (node[ContentEntry.COLUMN_NAME_VISIBILITY] === Visibility.DEFAULT.valueOf()) {
                const fileMapList: { [key: string]: any }[] = [];
                const fileMap: { [key: string]: any } = {};
                const identifier = node[ContentEntry.COLUMN_NAME_IDENTIFIER];
                fileMap['identifier'] = identifier;
                fileMap['path'] = node[ContentEntry.COLUMN_NAME_PATH]!;
                fileMapList.push(fileMap);
                const metaDataList = await this.getMetaData(fileMapList);
                size = metaDataList[identifier] ? metaDataList[identifier].size : 0;
            }
        } else {
            size = node[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] ? node[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] : 0;
        }
        return Promise.resolve(size ? size : 0);
    }

    private async updateInDb(contentsInDb: ContentEntry.SchemaMap[]) {
        this.dbService.beginTransaction();
        for (const element of contentsInDb) {
            const contentInDb = element as ContentEntry.SchemaMap;
            const identifier = contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER];

            await this.dbService.update({
                table: ContentEntry.TABLE_NAME,
                selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                selectionArgs: [identifier],
                modelJson: contentInDb
            }).toPromise();
        }
        this.dbService.endTransaction(true);
    }

    private async getMetaData(fileMapList: any[]) {
        return new Promise((resolve, reject) => {
            buildconfigreader.getMetaData(fileMapList,
                (entry) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}
