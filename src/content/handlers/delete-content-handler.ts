import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {ContentData, FileName, MimeType, State, Visibility} from '..';
import {FileService} from '../../util/file/def/file-service';
import {SharedPreferences} from '../../util/shared-preferences';
import {ContentKeys} from '../../preference-keys';
import {ArrayUtil} from '../../util/array-util';
import {FileUtil} from '../../util/file/util/file-util';
import { map } from 'rxjs/operators';

export class DeleteContentHandler {

    private updateNewContentModels: ContentEntry.SchemaMap[] = [];
    private fileMapList: { [key: string]: any }[] = [];

    constructor(private dbService: DbService,
                private fileService: FileService,
                private sharedPreferences: SharedPreferences) {
    }

    async deleteAllChildren(row: ContentEntry.SchemaMap, isChildContent: boolean) {
        let isUpdateLastModifiedTime = false;
        const manifestPath = ContentUtil.getBasePath(row[ContentEntry.COLUMN_NAME_PATH]!);
        await this.fileService.readAsText(manifestPath, FileName.MANIFEST.valueOf())
            .then(async (fileContents) => {
                const childContents = JSON.parse(fileContents).archive.items;
                childContents.shift();
                const childIdentifiers: string[] = [];
                childContents.forEach(element => {
                    childIdentifiers.push(element.identifier);
                });
                const childContentsFromDb: ContentEntry.SchemaMap[] = await this.findAllContentsFromDbWithIdentifiers(childIdentifiers);
                childContentsFromDb.forEach(async child => {
                    await this.deleteOrUpdateContent(child, true, isChildContent);
                    isUpdateLastModifiedTime = true;
                    const path: string = child[ContentEntry.COLUMN_NAME_PATH]!;
                    if (path && isUpdateLastModifiedTime) {
                        const contentRootPath: string | undefined = ContentUtil.getFirstPartOfThePathNameOnLastDelimiter(path);
                        if (contentRootPath) {
                            try {
                                // Update last modified time
                                this.sharedPreferences.putString(ContentKeys.KEY_LAST_MODIFIED,
                                    new Date().getMilliseconds() + '').toPromise();
                            } catch (e) {
                                console.log('Error', e);
                            }
                        }
                    }
                });
            }).catch((err) => {
                console.log('fileread err', err);
            });

        const metaDataList: any = await this.getMetaData(this.fileMapList);
        if (this.updateNewContentModels.length) {
            this.dbService.beginTransaction();
            // Update existing content in DB
            for (const e of this.updateNewContentModels) {
                const newContentModel = e as ContentEntry.SchemaMap;
                const identifier = newContentModel[ContentEntry.COLUMN_NAME_IDENTIFIER];

                let size = 0;
                if (metaDataList) {
                    size = metaDataList[identifier] ? metaDataList[identifier].size : 0;
                    // metaDataList[identifier].lastModifiedTime
                }
                newContentModel[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] = size;

                await this.dbService.update({
                    table: ContentEntry.TABLE_NAME,
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                    selectionArgs: [identifier],
                    modelJson: newContentModel
                }).toPromise();

            }
            this.dbService.endTransaction(true);
        }
    }

    async deleteOrUpdateContent(contentInDb: ContentEntry.SchemaMap, isChildItems: boolean, isChildContent: boolean) {
        let refCount: number = contentInDb[ContentEntry.COLUMN_NAME_REF_COUNT]!;
        let contentState: number;
        let visibility: string = contentInDb[ContentEntry.COLUMN_NAME_VISIBILITY]!;
        const mimeType: string = contentInDb[ContentEntry.COLUMN_NAME_MIME_TYPE];
        const path: string = contentInDb[ContentEntry.COLUMN_NAME_PATH]!;
        if (isChildContent) {
            // If visibility is Default it means this content was visible in my downloads.
            // After deleting artifact for this content it should not visible as well so reduce the refCount also for this.
            if (refCount > 1 && visibility === Visibility.DEFAULT.valueOf()) {
                refCount = refCount - 1;
                // Update visibility
                visibility = Visibility.PARENT.valueOf();
            }

            // Update the contentState
            // Do not update the content state if mimeType is "application/vnd.ekstep.content-collection"
            if (mimeType === MimeType.COLLECTION) {
                contentState = State.ARTIFACT_AVAILABLE.valueOf();
            } else {
                contentState = State.ONLY_SPINE.valueOf();
            }
        } else {
            // TODO: This check should be before updating the existing refCount.
            // Do not update the content state if mimeType is "application/vnd.ekstep.content-collection" and refCount is more than 1.
            if (mimeType === MimeType.COLLECTION.valueOf() && refCount > 1) {
                contentState = State.ARTIFACT_AVAILABLE.valueOf();
            } else if (refCount > 1 && isChildItems) {
                // Visibility will remain Default only.
                contentState = State.ARTIFACT_AVAILABLE.valueOf();
            } else {
                // Set the visibility to Parent so that this content will not visible in My contents / Downloads section.
                // Update visibility
                if (visibility === Visibility.DEFAULT.valueOf()) {
                    visibility = Visibility.PARENT.valueOf();
                }
                contentState = State.ONLY_SPINE.valueOf();
            }
            refCount = refCount - 1;

        }
        // if there are no entry in DB for any content then on this case contentModel.getPath() will be null
        if (path) {
            if (contentState === State.ONLY_SPINE.valueOf()) {
                const localData = contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA];
                const localContentData: ContentData = localData && JSON.parse(localData);
                let appIcon = '';
                let itemSetPreviewUrl = '';
                if (localData) {
                    appIcon = localContentData.appIcon ? FileUtil.getFileName(localContentData.appIcon) : '';
                    itemSetPreviewUrl = localContentData.itemSetPreviewUrl ? FileUtil.getFileName(localContentData.itemSetPreviewUrl) : '';
                }
                this.rm(ContentUtil.getBasePath(path), [appIcon, itemSetPreviewUrl].join(':'));
            }
            contentInDb[ContentEntry.COLUMN_NAME_VISIBILITY] = visibility;
            contentInDb[ContentEntry.COLUMN_NAME_REF_COUNT] = ContentUtil.addOrUpdateRefCount(refCount);
            contentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE] = contentState;
            if (!isChildItems) {
                contentInDb[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE] = 0;
                await this.dbService.update({
                    table: ContentEntry.TABLE_NAME,
                    modelJson: contentInDb,
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} =?`,
                    selectionArgs: [contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER]]
                }).pipe(
                    map(v => v > 0)
                ).toPromise();
            } else {
                const fileMap: { [key: string]: any } = {};
                fileMap['identifier'] = contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER];
                fileMap['path'] = ContentUtil.getBasePath(path);

                this.fileMapList.push(fileMap);

                this.updateNewContentModels.push(contentInDb);
            }
        }
    }

    private findAllContentsFromDbWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const filter = ` WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER} IN (${identifiersStr}) AND ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} ${filter}`;
        return this.dbService.execute(query).toPromise();
    }

    /** @internal */
    private rm(directoryPath, directoryToBeSkipped): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                sbutility.rm(directoryPath, directoryToBeSkipped, (status: boolean) => {
                    resolve(status);
                }, (err: boolean) => {
                    console.error(err);
                    reject(false);
                });
            } catch (xc) {
                console.error(xc);
                reject(false);
            }
        });
    }

    // TODO: move this method to file-service
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

}
