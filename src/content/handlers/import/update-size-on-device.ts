import { FileService } from './../../../util/file/def/file-service';
import {MimeType, Visibility, ImportContentContext} from '../..';
import {Response} from '../../../api';
import {DbService} from '../../../db';
import {ContentEntry} from '../../db/schema';
import {Observable} from 'rxjs';
import {ArrayUtil} from '../../../util/array-util';
import {ContentKeys} from '../../../preference-keys';
import {SharedPreferences} from '../../../util/shared-preferences';
import { tap, mergeMap } from 'rxjs/operators';

export class UpdateSizeOnDevice {

    constructor(private dbService: DbService, private sharedPreferences: SharedPreferences, private fileService: FileService) {
    }

    execute(): Promise<Response> {
        return this.updateAllRootContentSize().toPromise();
    }

    private findAllChildContents(childIdentifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME}
                       WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER} IN (${ArrayUtil.joinPreservingQuotes(childIdentifiers)})
                       AND ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
        return this.dbService.execute(query).toPromise();
    }

    updateAllRootContentSize(): Observable<any> {
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} WHERE ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0
        AND ${ContentEntry.COLUMN_NAME_VISIBILITY} = '${Visibility.DEFAULT.valueOf()}'`;
        return this.dbService.execute(query).pipe(
            tap(async () =>
                this.sharedPreferences.putBoolean(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, false).toPromise()
            ),
            mergeMap(async (rootContentsInDb: ContentEntry.SchemaMap[]) => {
                const updateContentModels: ContentEntry.SchemaMap[] = [];

                await Promise.all(rootContentsInDb.map(async (item) => {
                    let sizeOnDevice = await this.getSizeOnDevice(item);
                    const identifiers = JSON.parse(item[ContentEntry.COLUMN_NAME_LOCAL_DATA]).childNodes;
                    if (identifiers) {
                        const childContentsInDb: ContentEntry.SchemaMap[] = await this.findAllChildContents(identifiers);
                        childContentsInDb.forEach(content => {
                            sizeOnDevice += content[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] || 0;
                        });
                        item[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] = sizeOnDevice;
                        updateContentModels.push(item);
                    }
                }));
                this.updateInDb(updateContentModels);
            }),
            tap(async () =>
                this.sharedPreferences.putBoolean(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, true).toPromise()
            )
        );
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
                const metaDataList: any = await this.getMetaData(fileMapList);
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

            this.dbService.update({
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
            sbutility.getMetaData(fileMapList,
                (entry) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    private updateTextBookSize(rootContentId: string) {
        console.log('in updateAllRootContentSize');
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER} == ${rootContentId}`;
        return this.dbService.execute(query).pipe(
            tap(async () =>
                this.sharedPreferences.putBoolean(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, false).toPromise()
            ),
            mergeMap(async (rootContentsInDb: ContentEntry.SchemaMap[]) => {
                const updateContentModels: ContentEntry.SchemaMap[] = [];
                await Promise.all(rootContentsInDb.map(async (item) => {
                    let sizeOnDevice = await this.getSizeOnDevice(item);
                    const identifiers = JSON.parse(item[ContentEntry.COLUMN_NAME_LOCAL_DATA]).childNodes;
                    if (identifiers) {
                        const childContentsInDb: ContentEntry.SchemaMap[] = await this.findAllChildContents(identifiers);
                        childContentsInDb.forEach(content => {
                            sizeOnDevice += content[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] || 0;
                        });
                        item[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] = sizeOnDevice;
                        updateContentModels.push(item);
                    }
                }));
                this.updateInDb(updateContentModels);
            }),
            tap(async () =>
                this.sharedPreferences.putBoolean(ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL, true).toPromise()
            )
        );
    }

}
