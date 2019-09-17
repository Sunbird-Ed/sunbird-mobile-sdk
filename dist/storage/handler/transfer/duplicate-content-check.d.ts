import { Observable } from 'rxjs';
import { DbService } from '../../../db';
import { TransferContentContext } from '../transfer-content-handler';
import { FileService } from '../../../util/file/def/file-service';
export declare class DuplicateContentCheck {
    private dbService;
    private fileService;
    constructor(dbService: DbService, fileService: FileService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private getContentsInDb;
    private getPkgVersionFromFile;
    private generateMoveContentResponses;
}
