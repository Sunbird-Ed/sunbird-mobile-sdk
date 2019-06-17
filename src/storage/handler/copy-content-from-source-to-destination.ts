import {MoveContentResponse, MoveContentStatus, TransferContentContext} from './transfer-content-handler';
import {Observable} from 'rxjs';
import {ContentEntry} from '../../content/db/schema';
import {ExistingContentAction, StorageEventType, StorageTransferProgress} from '..';
import {EventNamespace, EventsBusService} from '../../events-bus';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CopyContentFromSourceToDestination {
    private contentsTransferred = 0;

    constructor(private eventsBusService: EventsBusService) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return Observable.defer(async () => {
            for (const content of context.contentsInSource!) {

                if (!context.duplicateContents || context.duplicateContents.length === 0) {
                    await this.copyFolder(
                        content[COLUMN_NAME_PATH]!,
                        context.destinationFolder! + content[COLUMN_NAME_IDENTIFIER]
                    );
                    await this.deleteFolder(content[COLUMN_NAME_PATH]!);
                    this.emitContentTransferProgress(context);
                    continue;
                }

                const moveContentResponse = context.duplicateContents!.find((m: MoveContentResponse) =>
                    m.identifier === content[COLUMN_NAME_IDENTIFIER]
                );

                if (!moveContentResponse) {
                    this.emitContentTransferProgress(context);
                    continue;
                }

                if (!context.existingContentAction) {
                    this.emitContentTransferProgress(context);
                    continue;
                }

                if (moveContentResponse.status === MoveContentStatus.SAME_VERSION_IN_BOTH) {
                    this.emitContentTransferProgress(context);
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

                this.emitContentTransferProgress(context);
            }

            return context;
        });
    }

    private emitContentTransferProgress(context: TransferContentContext) {
        this.eventsBusService.emit({
            namespace: EventNamespace.STORAGE,
            event: {
                type: StorageEventType.TRANSFER_PROGRESS,
                payload: {
                    progress: {
                        transferredCount: ++this.contentsTransferred,
                        totalCount: context.contentsInSource!.length
                    }
                }
            } as StorageTransferProgress
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

    private async copyToTempDestination(context: TransferContentContext,
                                        content: ContentEntry.SchemaMap,
                                        moveContentResponse: MoveContentResponse) {
        await this.renameFolder(context.destinationFolder!, moveContentResponse.identifier);
        await this.copyFolder(
            content[COLUMN_NAME_PATH]!,
            context.destinationFolder! + content[COLUMN_NAME_IDENTIFIER]
        );
    }

    private async removeSourceAndDestination(context: TransferContentContext,
                                             content: ContentEntry.SchemaMap,
                                             moveContentResponse: MoveContentResponse) {
        await this.deleteFolder(context.destinationFolder!.concat(moveContentResponse.identifier, '_temp'));
        await this.deleteFolder(content[COLUMN_NAME_PATH]!);
    }
}
