import { Observable } from 'rxjs';
import { TransferContentContext } from '../transfer-content-handler';
export declare class DeleteDestinationFolder {
    constructor();
    execute(context: TransferContentContext): Observable<TransferContentContext>;
}
