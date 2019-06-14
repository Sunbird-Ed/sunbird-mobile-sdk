import {ExistingContentAction, TransferContentsRequest} from '..';
import {Content} from '../../content';
import {Observable} from 'rxjs';
import {EventsBusService} from '../../events-bus';
import {DeviceMemoryCheck} from './device-memory-check';
import {ValidateDestinationContent} from './validate-destination-content';
import {DeleteDestinationFolder} from './delete-destination-folder';
import {DuplicateContentCheck} from './duplicate-content-check';
import {CopyContentFromSourceToDestination} from './copy-content-from-source-to-destination';
import {UpdateSourceContentPathInDb} from './update-source-content-path-in-db';
import {StoreDestinationContentInDb} from './store-destination-content-in-db';
import {ContentEntry} from '../../content/db/schema';
import {FileService} from '../../util/file/def/file-service';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';

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
    contentRootFolder?: string;
    contentsInSource?: ContentEntry.SchemaMap[];
    contentsInDestination?: Content[];
    existingContentAction?: ExistingContentAction;
    duplicateContents?: MoveContentResponse[];
    deleteDestination?: boolean;
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
    constructor(
        private sdkConfig: SdkConfig,
        private fileService: FileService,
        private dbService: DbService,
        private eventsBusService: EventsBusService,
        private deviceInfo: DeviceInfo
    ) {
    }

    handle({contentIds, existingContentAction, deleteDestination, destinationFolder}: TransferContentsRequest): Observable<undefined> {
        const context: TransferContentContext = {
            contentIds,
            existingContentAction,
            deleteDestination,
            destinationFolder
        };

        return new DeleteDestinationFolder().execute()
            .mergeMap(() => new DeviceMemoryCheck().execute())
            .mergeMap(() => new ValidateDestinationContent(this.fileService, this.sdkConfig.appConfig).execute(context))
            .mergeMap(() => new DuplicateContentCheck(this.dbService, this.fileService).execute(context))
            .mergeMap(() => new CopyContentFromSourceToDestination(this.eventsBusService).execute(context))
            .mergeMap(() => new UpdateSourceContentPathInDb(this.dbService).execute(context))
            .mergeMap(() => new StoreDestinationContentInDb(this.sdkConfig.appConfig, this.fileService, this.dbService, this.deviceInfo).execute(context))
            .mapTo(undefined);
    }
}
