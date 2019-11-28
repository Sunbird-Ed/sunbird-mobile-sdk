import { TransferContentContext } from '../transfer-content-handler';
import { DbService } from '../../../db';
import { Observable } from 'rxjs';
export declare class UpdateSourceContentPathInDb {
    private dbService;
    constructor(dbService: DbService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
}
