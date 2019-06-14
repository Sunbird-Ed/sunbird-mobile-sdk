import {Observable} from 'rxjs';
import {FileService} from '../../util/file/def/file-service';
import {Manifest, MoveContentStatus, TransferContentContext} from './transfer-content-handler';
import {ContentEntry} from '../../content/db/schema';
import {ContentUtil} from '../../content/util/content-util';
import {ContentStatus, MimeType, State, Visibility} from '../../content';
import {DbService} from '../../db';
import * as moment from 'moment';
import {AppConfig} from '../../api/config/app-config';
import {ExistingContentAction} from '..';
import {DeviceInfo} from '../../util/device';

export class StoreDestinationContentInDb {
    public static MANIFEST_FILE_NAME = 'manifest.json';

    constructor(
        private appConfig: AppConfig,
        private fileService: FileService,
        private dbService: DbService,
        private deviceInfo: DeviceInfo
    ) {
    }

    execute(context: TransferContentContext): Observable<void> {
        return Observable.defer(async () => {
            let addedContentIdentifiers;

            for (const duplicateContent of context.duplicateContents!) {

                switch (context.existingContentAction || ExistingContentAction.IGNORE) {
                    case ExistingContentAction.KEEP_HIGER_VERSION:
                        if (duplicateContent.status === MoveContentStatus.HIGHER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.contentRootFolder!, false);
                        }
                        break;
                    case ExistingContentAction.KEEP_LOWER_VERSION:
                        if (duplicateContent.status === MoveContentStatus.LOWER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.contentRootFolder!, true);
                        }
                        break;
                    case ExistingContentAction.KEEP_DESTINATION:
                    case ExistingContentAction.IGNORE:
                        if (duplicateContent.status === MoveContentStatus.LOWER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.contentRootFolder!, true);
                        } else {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.contentRootFolder!, false);
                        }
                        break;
                }
            }

            if (context.validContentIdsInDestination && context.validContentIdsInDestination.length &&
                context.duplicateContents && context.duplicateContents.length) {
                addedContentIdentifiers = this.getNewlyAddedContents(
                    context.validContentIdsInDestination, context.validContentIdsInDestination
                );
            } else if ((!context.validContentIdsInDestination || !context.duplicateContents!.length)
                && (context.validContentIdsInDestination && context.validContentIdsInDestination.length)) {
                addedContentIdentifiers = context.validContentIdsInDestination;
            }

            if (addedContentIdentifiers) {
                // Read content in destination folder.
                for (const identifier of addedContentIdentifiers) {
                    this.addDestinationContentInDb(identifier, context.contentRootFolder!, false);
                }
            }
        });
    }

    private getNewlyAddedContents(foldersList: string[], contentIdentifiers: string[]): string[] {
        return foldersList.filter((folder) => {
            return contentIdentifiers.find((id) => id !== folder);
        });
    }

    private addDestinationContentInDb(identifier: string, storageFolder: string, keepLowerVersion: boolean) {
        const destinationPath = storageFolder.concat(identifier);
        this.fileService.readAsText(storageFolder.concat(identifier),
            StoreDestinationContentInDb.MANIFEST_FILE_NAME).then((manifestStringified) => {
            const manifest: Manifest = JSON.parse(manifestStringified);
            const items: any[] = manifest.archive.items;
            return this.extractContentFromItem(items, destinationPath.concat('/'), manifest['ver'], keepLowerVersion);
        });
    }

    private async extractContentFromItem(items: any[], destinationPath: string, manifestVersion: string, keepLowerVersion: boolean) {
        const insertNewContentModels: ContentEntry.SchemaMap[] = [];
        const updateNewContentModels: ContentEntry.SchemaMap[] = [];
        for (const e of items) {
            let element = e as any;
            const identifier = element.identifier;
            const mimeType = element.mimeType;
            const contentType = ContentUtil.readContentType(element);
            let visibility = ContentUtil.readVisibility(element);
            const audience = ContentUtil.readAudience(element);
            const pragma = ContentUtil.readPragma(element);
            const compatibilityLevel = ContentUtil.readCompatibilityLevel(element);
            const pkgVersion = element.pkgVersion;
            const artifactUrl = element.artifactUrl;
            let contentState = State.ONLY_SPINE.valueOf();
            const board = element.board;
            const medium = element.medium;
            const grade = element.gradeLevel;
            const existingContentModel: ContentEntry.SchemaMap | undefined =
                (await this.dbService.read({
                    table: ContentEntry.TABLE_NAME,
                    columns: [],
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                    selectionArgs: [identifier]
                }).toPromise())[0];
            const existingContentPath = existingContentModel &&
                ContentUtil.getBasePath(existingContentModel[ContentEntry.COLUMN_NAME_PATH]!);
            let doesContentExist: boolean = ContentUtil.doesContentExist(existingContentModel, identifier, pkgVersion, keepLowerVersion);
            if (doesContentExist && !(element.status === ContentStatus.DRAFT.valueOf())) {
                if (existingContentModel![ContentEntry.COLUMN_NAME_VISIBILITY] === Visibility.DEFAULT.valueOf()) {
                    element = JSON.parse(existingContentModel![ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                }
            } else {
                doesContentExist = false;

                if (ContentUtil.isCompatible(this.appConfig, compatibilityLevel)) {
                    // Add or update the content_state
                    if (MimeType.COLLECTION.valueOf() === mimeType) {
                        contentState = State.ARTIFACT_AVAILABLE.valueOf();
                    } else {
                        contentState = State.ARTIFACT_AVAILABLE.valueOf();
                    }
                }
            }
            const referenceCount = this.getReferenceCount(existingContentModel, visibility);
            visibility = this.getContentVisibility(existingContentModel, element['objectType'], visibility);
            contentState = this.getContentState(existingContentModel, contentState);
            const basePath = !doesContentExist ? destinationPath : existingContentPath;
            const sizeOnDevice = await this.fileService.getDirectorySize(basePath!);
            ContentUtil.addOrUpdateViralityMetadata(element, this.deviceInfo.getDeviceID().toString());
            const newContentModel: ContentEntry.SchemaMap = this.constructContentDBModel(identifier, manifestVersion,
                JSON.stringify(element), mimeType, contentType, visibility, basePath,
                referenceCount, contentState, audience, pragma, sizeOnDevice, board, medium, grade);
            if (!existingContentModel) {
                insertNewContentModels.push(newContentModel);
            } else {
                updateNewContentModels.push(newContentModel);
            }
        }
        if (insertNewContentModels.length || updateNewContentModels.length) {
            this.dbService.beginTransaction();
            // Insert into DB
            for (const e of insertNewContentModels) {
                const newContentModel = e as ContentEntry.SchemaMap;
                await this.dbService.insert({
                    table: ContentEntry.TABLE_NAME,
                    modelJson: newContentModel
                }).toPromise();
            }

            // Update existing content in DB
            for (const e of updateNewContentModels) {
                const newContentModel = e as ContentEntry.SchemaMap;
                await this.dbService.update({
                    table: ContentEntry.TABLE_NAME,
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                    selectionArgs: [newContentModel[ContentEntry.COLUMN_NAME_IDENTIFIER]],
                    modelJson: newContentModel
                }).toPromise();
            }
            this.dbService.endTransaction(true);
        }

    }

    private constructContentDBModel(identifier, manifestVersion, localData,
                                    mimeType, contentType, visibility, path,
                                    refCount, contentState, audience, pragma, sizeOnDevice, board, medium, grade): ContentEntry.SchemaMap {
        return {
            [ContentEntry.COLUMN_NAME_IDENTIFIER]: identifier,
            [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
            [ContentEntry.COLUMN_NAME_PATH]: ContentUtil.getBasePath(path),
            [ContentEntry.COLUMN_NAME_REF_COUNT]: refCount,
            [ContentEntry.COLUMN_NAME_CONTENT_STATE]: contentState,
            [ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE]: sizeOnDevice,
            [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: manifestVersion,
            [ContentEntry.COLUMN_NAME_LOCAL_DATA]: localData,
            [ContentEntry.COLUMN_NAME_MIME_TYPE]: mimeType,
            [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: contentType,
            [ContentEntry.COLUMN_NAME_VISIBILITY]: visibility,
            [ContentEntry.COLUMN_NAME_AUDIENCE]: audience,
            [ContentEntry.COLUMN_NAME_PRAGMA]: pragma,
            [ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON]: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ'),
            [ContentEntry.COLUMN_NAME_BOARD]: ContentUtil.getContentAttribute(board),
            [ContentEntry.COLUMN_NAME_MEDIUM]: ContentUtil.getContentAttribute(medium),
            [ContentEntry.COLUMN_NAME_GRADE]: ContentUtil.getContentAttribute(grade)
        };

    }

    private getReferenceCount(existingContent, visibility: string): number {
        let refCount: number;
        if (existingContent) {
            refCount = existingContent[ContentEntry.COLUMN_NAME_REF_COUNT];

            // if the content has a 'Default' visibility and update the same content then don't increase the reference count...
            if (!(Visibility.DEFAULT.valueOf() === existingContent[ContentEntry.COLUMN_NAME_VISIBILITY]
                && Visibility.DEFAULT.valueOf() === visibility)) {
                refCount = refCount + 1;
            }
        } else {
            refCount = 1;
        }
        return refCount;
    }

    /**
     * add or update the reference count for the content
     *
     */
    private getContentVisibility(existingContentInDb, objectType, previuosVisibility: string): string {
        let visibility;
        if ('Library' === objectType) {
            visibility = Visibility.PARENT.valueOf();
        } else if (existingContentInDb) {
            if (!Visibility.PARENT.valueOf() === existingContentInDb[ContentEntry.COLUMN_NAME_VISIBILITY]) {
                // If not started from child content then do not shrink visibility.
                visibility = existingContentInDb[ContentEntry.COLUMN_NAME_VISIBILITY];
            }
        }
        return visibility ? visibility : previuosVisibility;
    }

    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    private getContentState(existingContentInDb, contentState: number): number {
        if (existingContentInDb && existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE] > contentState) {
            contentState = existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE];
        }
        return contentState;
    }
}
