import { Observable } from 'rxjs';
import { TransferContentContext } from './transfer-content-handler';
import { DbService } from '../../db';
export declare class UpdateSourceContentPathInDb {
    private dbService;
    constructor(dbService: DbService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
}
