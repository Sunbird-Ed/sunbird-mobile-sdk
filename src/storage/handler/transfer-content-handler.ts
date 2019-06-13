import {ExistingContentAction, StorageDestination} from '..';
import {Content} from '../../content';
import {Observable} from 'rxjs';
import {EventsBusService} from '../../events-bus';
import {DeviceMemoryCheck} from './device-memory-check';
import {ValidateDestinationContent} from './validate-destination-content';
import {DeleteDestinationFolder} from './delete-destination-folder';
import {DuplicateContentCheck} from './duplicate-content-check';
import {CopyContentFromSourceToDestination} from './copy-content-from-source-to-destination';
import {DeleteSourceFolder} from './delete-source-folder';
import {UpdateSourceContentPathInDb} from './update-source-content-path-in-db';
import {StoreDestinationContentInDb} from './store-destination-content-in-db';

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
    contentsInSource?: Content[];
    contentsInDestination?: Content[];
    existingContentAction?: ExistingContentAction;
    duplicateContents?: MoveContentResponse;
    deleteDestination?: boolean;
}

export class TransferContentHandler {
    handle(storageDestination: StorageDestination, content: Content, eventsBusService: EventsBusService): Observable<undefined> {
        return new DeleteDestinationFolder().execute()
            .mergeMap(() => new DeviceMemoryCheck().execute())
            .mergeMap(() => new ValidateDestinationContent().execute())
            .mergeMap(() => new DuplicateContentCheck().execute())
            .mergeMap(() => new CopyContentFromSourceToDestination().execute())
            .mergeMap(() => new DeleteSourceFolder().execute())
            .mergeMap(() => new UpdateSourceContentPathInDb().execute())
            .mergeMap(() => new StoreDestinationContentInDb().execute())
            .mapTo(undefined);
    }
}
