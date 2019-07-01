import { Observable } from 'rxjs';
import { TransferContentContext } from '../transfer-content-handler';
import { DbService } from '../../../db';
export declare class DeviceMemoryCheck {
    private dbService;
    constructor(dbService: DbService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private getFreeUsableSpace;
}
