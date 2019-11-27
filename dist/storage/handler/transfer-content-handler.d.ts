import { ExistingContentAction, TransferContentsRequest } from '..';
import { Content } from '../../content';
import { EventsBusService } from '../../events-bus';
import { ContentEntry } from '../../content/db/schema';
import { FileService } from '../../util/file/def/file-service';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { DeviceInfo } from '../../util/device';
import { Observable } from 'rxjs';
export declare enum MoveContentStatus {
    SAME_VERSION_IN_BOTH = "SAME_VERSION_IN_BOTH",
    HIGHER_VERSION_IN_DESTINATION = "HIGHER_VERSION_IN_DESTINATION",
    LOWER_VERSION_IN_DESTINATION = "LOWER_VERSION_IN_DESTINATION"
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
            status: string;
            expires: string;
        }[];
    };
}
export declare class TransferContentHandler {
    private sdkConfig;
    private fileService;
    private dbService;
    private eventsBusService;
    private deviceInfo;
    private readonly context;
    constructor(sdkConfig: SdkConfig, fileService: FileService, dbService: DbService, eventsBusService: EventsBusService, deviceInfo: DeviceInfo);
    transfer({ contentIds, existingContentAction, deleteDestination, destinationFolder, shouldMergeInDestination, sourceFolder }: TransferContentsRequest): Observable<undefined>;
    cancel(): Observable<undefined>;
}
