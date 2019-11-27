import { TransferContentContext } from '../transfer-content-handler';
import { EventsBusService } from '../../../events-bus';
import { Observable } from 'rxjs';
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
