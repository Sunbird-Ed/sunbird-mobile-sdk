import { StorageDestination } from '..';
import { Content } from '../../content';
import { Observable } from 'rxjs';
import { EventsBusService } from '../../events-bus';
export declare class TransferContentHandler {
    handle(storageDestination: StorageDestination, content: Content, eventsBusService: EventsBusService): Observable<undefined>;
}
