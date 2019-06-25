import { TransferContentContext } from '../transfer-content-handler';
import { Observable } from 'rxjs';
import { EventsBusService } from '../../../events-bus';
export declare class DeleteSourceFolder {
    private eventsBusService;
    constructor(eventsBusService: EventsBusService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private deleteFolder;
    private copyFolder;
    private renameFolder;
    private removeSourceAndDestination;
}
