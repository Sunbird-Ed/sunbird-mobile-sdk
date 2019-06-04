import {StorageDestination} from '..';
import {Content} from '../../content';
import {Observable} from 'rxjs';

export class TransferContentHandler {
    handle(storageDestination: StorageDestination, content: Content): Observable<undefined> {
        // TODO
        throw new Error('Not Implemented');
    }
}
