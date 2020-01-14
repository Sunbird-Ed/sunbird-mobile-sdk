import {
    ExistingContentAction,
    StorageEventType,
    StorageTransferCompleted,
    StorageTransferFailedDuplicateContent, StorageTransferFailedLowMemory,
    StorageTransferRevertCompleted,
    TransferContentsRequest
} from '..';
import {Content} from '../../content';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {DeviceMemoryCheck} from './transfer/device-memory-check';
import {ValidateDestinationContent} from './transfer/validate-destination-content';
import {DeleteDestinationFolder} from './transfer/delete-destination-folder';
import {DuplicateContentCheck} from './transfer/duplicate-content-check';
import {CopyContentFromSourceToDestination} from './transfer/copy-content-from-source-to-destination';
import {UpdateSourceContentPathInDb} from './transfer/update-source-content-path-in-db';
import {StoreDestinationContentInDb} from './transfer/store-destination-content-in-db';
import {ContentEntry} from '../../content/db/schema';
import {FileService} from '../../util/file/def/file-service';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {ValidateDestinationFolder} from './transfer/validate-destination-folder';
import {DeleteSourceFolder} from './transfer/delete-source-folder';
import {CancellationError} from '../errors/cancellation-error';
import {DuplicateContentError} from '../errors/duplicate-content-error';
import {LowMemoryError} from '../errors/low-memory-error';
import {defer, Observable, throwError} from 'rxjs';
import {catchError, mapTo, mergeMap, tap} from 'rxjs/operators';

export enum MoveContentStatus {
    SAME_VERSION_IN_BOTH = 'SAME_VERSION_IN_BOTH',
    HIGHER_VERSION_IN_DESTINATION = 'HIGHER_VERSION_IN_DESTINATION',
    LOWER_VERSION_IN_DESTINATION = 'LOWER_VERSION_IN_DESTINATION'
}

export interface MoveContentResponse {
    identifier: string;
    status: MoveContentStatus;
}

export interface TransferContentContext {
    contentIds?: string[];
    validContentIdsInDestination?: string[];
    destinationFolder?: string;
    sourceFolder?: string;
    contentsInSource?: ContentEntry.SchemaMap[];
    contentsInDestination?: Content[];
    existingContentAction?: ExistingContentAction;
    duplicateContents?: MoveContentResponse[];
    deleteDestination?: boolean;
    hasTransferCancelled?: boolean;
    shouldMergeInDestination?: boolean;
}

export interface Manifest {
    version: string;
    archive: {
        items: {
            status: string
            expires: string
        }[];
    };
}

export class TransferContentHandler {
    private readonly context: TransferContentContext = {};

    constructor(
        private sdkConfig: SdkConfig,
        private fileService: FileService,
        private dbService: DbService,
        private eventsBusService: EventsBusService,
        private deviceInfo: DeviceInfo
    ) {
    }

    transfer({contentIds, existingContentAction, deleteDestination, destinationFolder, shouldMergeInDestination, sourceFolder}:
                 TransferContentsRequest): Observable<undefined> {
        this.context.hasTransferCancelled = false;
        this.context.shouldMergeInDestination = shouldMergeInDestination;
        this.context.contentIds = contentIds;
        this.context.existingContentAction = existingContentAction;
        this.context.deleteDestination = deleteDestination;
        this.context.destinationFolder = destinationFolder;
        this.context.sourceFolder = sourceFolder;

        return new ValidateDestinationFolder(this.fileService).execute(this.context).pipe(
            mergeMap((transferContext: TransferContentContext) => {
                return new DeleteDestinationFolder().execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new DeviceMemoryCheck(this.dbService).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new ValidateDestinationContent(this.fileService, this.sdkConfig.appConfig).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new DuplicateContentCheck(this.dbService, this.fileService).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new CopyContentFromSourceToDestination(this.eventsBusService).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new DeleteSourceFolder(this.eventsBusService).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new UpdateSourceContentPathInDb(this.dbService).execute(transferContext);
            }),
            mergeMap((transferContext: TransferContentContext) => {
                return new StoreDestinationContentInDb(this.sdkConfig.appConfig,
                    this.fileService, this.dbService, this.deviceInfo).execute(transferContext);
            })
        ).pipe(
            tap(() => {
                this.eventsBusService.emit({
                    namespace: EventNamespace.STORAGE,
                    event: {
                        type: StorageEventType.TRANSFER_COMPLETED
                    } as StorageTransferCompleted
                });
            }),
            mapTo(undefined),
            catchError((e) => {
                if (e instanceof CancellationError) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.STORAGE,
                        event: {
                            type: StorageEventType.TRANSFER_REVERT_COMPLETED
                        } as StorageTransferRevertCompleted
                    });
                } else if (e instanceof DuplicateContentError) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.STORAGE,
                        event: {
                            type: StorageEventType.TRANSFER_FAILED_DUPLICATE_CONTENT
                        } as StorageTransferFailedDuplicateContent
                    });
                } else if (e instanceof LowMemoryError) {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.STORAGE,
                        event: {
                            type: StorageEventType.TRANSFER_FAILED_LOW_MEMORY
                        } as StorageTransferFailedLowMemory
                    });
                }

                console.error('Error', e);

                return throwError(e);
            })
        );
    }

    cancel(): Observable<undefined> {
        return defer(async () => {
            this.context.hasTransferCancelled = true;
        }).pipe(
            mapTo(undefined)
        );
    }
}
