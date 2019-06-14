import {MoveContentResponse, MoveContentStatus, TransferContentContext} from './transfer-content-handler';
import {Observable} from 'rxjs';
import {ContentEntry} from '../../content/db/schema';
import {ExistingContentAction} from '..';
import {ContentUtil} from '../../content/util/content-util';
import {EventsBusService} from '../../events-bus';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CopyContentFromSourceToDestination {
    constructor(eventsBusService: EventsBusService) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return Observable.defer(async () => {
            for (const content of context.contentsInSource!) {

                if (!context.duplicateContents || context.duplicateContents.length === 0) {
                    // TODO: check if destinationFolder || contentRootFolder
                    await this.copyFolder(
                        content[COLUMN_NAME_PATH]!,
                        ContentUtil.getContentRootDir(context.destinationFolder!) + content[COLUMN_NAME_IDENTIFIER]
                    );
                }

                const moveContentResponse = context.duplicateContents!.find((m: MoveContentResponse) =>
                    m.identifier === content[COLUMN_NAME_IDENTIFIER]
                );

                if (!moveContentResponse) {
                    await this.copyFolder(
                        content[COLUMN_NAME_PATH]!,
                        ContentUtil.getContentRootDir(context.destinationFolder!) + content[COLUMN_NAME_IDENTIFIER]
                    );

                    continue;
                }

                if (!context.existingContentAction) {
                    continue;
                }

                if (moveContentResponse.status === MoveContentStatus.SAME_VERSION_IN_BOTH) {
                    continue;
                }

                switch (context.existingContentAction) {
                    case ExistingContentAction.KEEP_HIGER_VERSION:
                        if (moveContentResponse.status === MoveContentStatus.HIGHER_VERSION_IN_DESTINATION) {
                            break;
                        }
                        await this.copyToTempDestination(context, content, moveContentResponse);
                        await this.removeSourceAndDestination(context, content, moveContentResponse);
                        break;
                    case ExistingContentAction.KEEP_LOWER_VERSION:
                        if (moveContentResponse.status === MoveContentStatus.LOWER_VERSION_IN_DESTINATION) {
                            break;
                        }
                        await this.copyToTempDestination(context, content, moveContentResponse);
                        await this.removeSourceAndDestination(context, content, moveContentResponse);
                        break;
                    case ExistingContentAction.KEEP_SOURCE:
                        await this.copyToTempDestination(context, content, moveContentResponse);
                        await this.removeSourceAndDestination(context, content, moveContentResponse);
                        break;
                    case ExistingContentAction.IGNORE:
                    case ExistingContentAction.KEEP_DESTINATION:
                }
            }

            return context;
        });
    }

    private async deleteFolder(deletedirectory: string): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            buildconfigreader.rm(deletedirectory, '', () => {
                resolve();
            }, (e) => {
                reject(e);
            });
        });
    }

    private async copyFolder(sourceDirectory: string, destinationDirectory: string): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            buildconfigreader.copyDirectory(sourceDirectory, destinationDirectory, () => {
                resolve();
            }, (e) => {
                reject(e);
            });
        });
    }

    private async renameFolder(sourceDirectory: string, toDirectoryName: string): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            buildconfigreader.renameDirectory(sourceDirectory, toDirectoryName, () => {
                resolve();
            }, (e) => {
                reject(e);
            });
        });
    }

    private async copyToTempDestination(context: TransferContentContext, content: ContentEntry.SchemaMap, moveContentResponse: MoveContentResponse) {
        await this.renameFolder(ContentUtil.getContentRootDir(context.destinationFolder!), moveContentResponse.identifier);
        await this.copyFolder(
            content[COLUMN_NAME_PATH]!,
            ContentUtil.getContentRootDir(context.destinationFolder!) + content[COLUMN_NAME_IDENTIFIER]
        );
    }

    private async removeSourceAndDestination(context: TransferContentContext, content: ContentEntry.SchemaMap, moveContentResponse: MoveContentResponse) {
        await this.deleteFolder(ContentUtil.getContentRootDir(context.destinationFolder!) + moveContentResponse.identifier);
        await this.deleteFolder(content[COLUMN_NAME_PATH]!);
    }
}
