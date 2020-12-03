import {FileService} from '../../../util/file/def/file-service';
import {Manifest, MoveContentStatus, TransferContentContext} from '../transfer-content-handler';
import {ContentEntry} from '../../../content/db/schema';
import {ContentUtil} from '../../../content/util/content-util';
import {ContentStatus, FileName, MimeType, State, Visibility} from '../../../content';
import {DbService} from '../../../db';
import {AppConfig} from '../../../api/config/app-config';
import {ExistingContentAction} from '../..';
import {DeviceInfo} from '../../../util/device';
import {defer, Observable} from 'rxjs';

export class StoreDestinationContentInDb {

    constructor(
        private appConfig: AppConfig,
        private fileService: FileService,
        private dbService: DbService,
        private deviceInfo: DeviceInfo
    ) {
    }

    execute(context: TransferContentContext): Observable<void> {
        return defer(async () => {
            let addedContentIdentifiers;

            for (const duplicateContent of context.duplicateContents!) {

                switch (context.existingContentAction || ExistingContentAction.IGNORE) {
                    case ExistingContentAction.KEEP_HIGER_VERSION:
                        if (duplicateContent.status === MoveContentStatus.HIGHER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.destinationFolder!, false);
                        }
                        break;
                    case ExistingContentAction.KEEP_LOWER_VERSION:
                        if (duplicateContent.status === MoveContentStatus.LOWER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.destinationFolder!, true);
                        }
                        break;
                    case ExistingContentAction.KEEP_DESTINATION:
                    case ExistingContentAction.IGNORE:
                        if (duplicateContent.status === MoveContentStatus.LOWER_VERSION_IN_DESTINATION) {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.destinationFolder!, true);
                        } else {
                            this.addDestinationContentInDb(duplicateContent.identifier, context.destinationFolder!, false);
                        }
                        break;
                }
            }

            if (context.validContentIdsInDestination && context.validContentIdsInDestination.length &&
                context.duplicateContents && context.duplicateContents.length) {
                addedContentIdentifiers = this.getNewlyAddedContents(
                    context.validContentIdsInDestination, context.duplicateContents.map(element => element.identifier)
                );
            } else if ((!context.validContentIdsInDestination || !context.duplicateContents!.length)
                && (context.validContentIdsInDestination && context.validContentIdsInDestination.length)) {
                addedContentIdentifiers = context.validContentIdsInDestination;
            }

            if (addedContentIdentifiers) {
                // Read content in destination folder.
                for (const identifier of addedContentIdentifiers) {
                    await this.addDestinationContentInDb(identifier, context.destinationFolder!, false);
                }
            }
        });
    }

    private getNewlyAddedContents(foldersList: string[], contentIdentifiers: string[]): string[] {
        return foldersList.filter((folder) => {
            return contentIdentifiers.find((id) => id !== folder);
        });
    }

    private addDestinationContentInDb(identifier: string, storageFolder: string, keepLowerVersion: boolean): Promise<void> {
        const destinationPath = storageFolder.concat(identifier);
        return this.fileService.readAsText(
            storageFolder.concat(identifier),
            FileName.MANIFEST.valueOf()
        ).then((manifestStringified) => {
            const manifest: Manifest = JSON.parse(manifestStringified);
            const items: any[] = manifest.archive.items;
            return this.extractContentFromItem(items, destinationPath.concat('/'), manifest['ver'], keepLowerVersion);
        }).catch((e) => {
            console.error(e);
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
            const primaryCategory = ContentUtil.readPrimaryCategory(element);
            let visibility = ContentUtil.readVisibility(element);
            const audience = ContentUtil.readAudience(element);
            const pragma = ContentUtil.readPragma(element);
            const pkgVersion = element.pkgVersion;
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
                // Add or update the content_state
                if (MimeType.COLLECTION.valueOf() === mimeType) {
                    contentState = State.ARTIFACT_AVAILABLE.valueOf();
                } else {
                    contentState = State.ARTIFACT_AVAILABLE.valueOf();
                }
            }
            const referenceCount = ContentUtil.getReferenceCount(existingContentModel, visibility);
            visibility = ContentUtil.getContentVisibility(existingContentModel, element['objectType'], visibility);
            contentState = ContentUtil.getContentState(existingContentModel, contentState);
            const basePath = !doesContentExist ? destinationPath : existingContentPath;
            const sizeOnDevice = await this.fileService.getDirectorySize(basePath!);
            ContentUtil.addOrUpdateViralityMetadata(element, this.deviceInfo.getDeviceID().toString());
            const newContentModel: ContentEntry.SchemaMap = ContentUtil.constructContentDBModel(identifier, manifestVersion,
                JSON.stringify(element), mimeType, contentType, visibility, basePath,
                referenceCount, contentState, audience, pragma, sizeOnDevice, board, medium, grade, primaryCategory);
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

}
