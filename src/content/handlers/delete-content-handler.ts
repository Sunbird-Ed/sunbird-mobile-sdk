import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {MimeType, State, Visibility} from '../util/content-constants';
import Queue from 'typescript-collections/dist/lib/Queue';
import {FileService} from '../../util/file/def/file-service';
import {SharedPreferences} from '../../util/shared-preferences';
import {ContentKeys} from '../../preference-keys';
import {ArrayUtil} from '../../util/array-util';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;
import COLUMN_NAME_MIME_TYPE = ContentEntry.COLUMN_NAME_MIME_TYPE;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import KEY_LAST_MODIFIED = ContentKeys.KEY_LAST_MODIFIED;

export class DeleteContentHandler {

    private updateNewContentModels: ContentEntry.SchemaMap[] = [];
    private fileMapList: { [key: string]: any }[] = [];

    constructor(private dbService: DbService,
                private fileService: FileService,
                private sharedPreferences: SharedPreferences) {
    }

    async deleteAllChildren(row: ContentEntry.SchemaMap, isChildContent: boolean) {
        let isUpdateLastModifiedTime = false;
        const contentInDbList: Queue<ContentEntry.SchemaMap> = new Queue();
        // TODO Add LinkedList for ordering issue
        contentInDbList.add(row);
        let node: ContentEntry.SchemaMap | undefined;
        while (!contentInDbList.isEmpty()) {
            node = contentInDbList.dequeue();
            if (ContentUtil.hasChildren(node![ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                const childContentsIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(
                    node![ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                const contentsInDB: ContentEntry.SchemaMap[] = await this.findAllContentsFromDbWithIdentifiers(childContentsIdentifiers);
                contentsInDB.forEach((contentInDb: ContentEntry.SchemaMap) => {
                    contentInDbList.add(contentInDb);
                });
            }

            // Deleting only child content
            if (!(row[COLUMN_NAME_IDENTIFIER] === node![COLUMN_NAME_IDENTIFIER])) {
                isUpdateLastModifiedTime = true;
                await this.deleteOrUpdateContent(node!, true, isChildContent);
            }
        }

        const path: string = row[COLUMN_NAME_PATH]!;
        if (path && isUpdateLastModifiedTime) {
            const contentRootPath: string | undefined = ContentUtil.getFirstPartOfThePathNameOnLastDelimiter(path);
            if (contentRootPath) {
                try {
                    // Update last modified time
                    await this.sharedPreferences.putString(KEY_LAST_MODIFIED, new Date().getMilliseconds() + '').toPromise();
                } catch (e) {
                    console.log('Error', e);
                }
            }
        }

        const metaDataList = await this.getMetaData(this.fileMapList);
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
        let refCount: number = contentInDb[COLUMN_NAME_REF_COUNT]!;
        let contentState: number;
        let visibility: string = contentInDb[COLUMN_NAME_VISIBILITY]!;
        const mimeType: string = contentInDb[COLUMN_NAME_MIME_TYPE];
        const path: string = contentInDb[COLUMN_NAME_PATH]!;
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
                await this.rm(ContentUtil.getBasePath(path), contentInDb[COLUMN_NAME_IDENTIFIER]);
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
                }).map(v => v > 0).toPromise();
            } else {
                const fileMap: { [key: string]: any } = {};
                fileMap['identifier'] = contentInDb[COLUMN_NAME_IDENTIFIER];
                fileMap['path'] = ContentUtil.getBasePath(path);

                this.fileMapList.push(fileMap);

                this.updateNewContentModels.push(contentInDb);
            }
        }
    }

    private findAllContentsFromDbWithIdentifiers(identifiers: string[]): Promise<ContentEntry.SchemaMap[]> {
        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const filter = ` WHERE ${COLUMN_NAME_IDENTIFIER} IN (${identifiersStr}) AND ${COLUMN_NAME_REF_COUNT} > 0`;
        const query = `SELECT * FROM ${ContentEntry.TABLE_NAME} ${filter}`;
        return this.dbService.execute(query).toPromise();
    }

    /** @internal */
    private rm(directoryPath, directoryToBeSkipped): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                buildconfigreader.rm(directoryPath, directoryToBeSkipped, (status: boolean) => {
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
