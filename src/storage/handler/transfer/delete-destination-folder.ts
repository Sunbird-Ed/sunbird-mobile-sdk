import {Observable, of} from 'rxjs';
import {TransferContentContext} from '../transfer-content-handler';

export class DeleteDestinationFolder {
    constructor() {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return of(context);
    }
}
