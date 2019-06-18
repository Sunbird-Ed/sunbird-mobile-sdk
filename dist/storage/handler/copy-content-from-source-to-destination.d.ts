import { TransferContentContext } from './transfer-content-handler';
import { Observable } from 'rxjs';
import { EventsBusService } from '../../events-bus';
export declare class CopyContentFromSourceToDestination {
    private eventsBusService;
    private contentsTransferred;
    constructor(eventsBusService: EventsBusService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private emitContentTransferProgress;
    private deleteFolder;
    private copyFolder;
    private renameFolder;
    private copyToTempDestination;
    private removeSourceAndDestination;
}
