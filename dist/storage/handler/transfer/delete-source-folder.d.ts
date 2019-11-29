import { TransferContentContext } from '../transfer-content-handler';
import { EventsBusService } from '../../../events-bus';
import { Observable } from 'rxjs';
export declare class DeleteSourceFolder {
    private eventsBusService;
    constructor(eventsBusService: EventsBusService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private deleteFolder;
    private copyFolder;
    private renameFolder;
    private removeSourceAndDestination;
}
