import { TransferContentContext } from './transfer-content-handler';
import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
export declare class ValidateDestinationFolder {
    private fileService;
    constructor(fileService: FileService);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private validate;
    private createDirectory;
    private canWrite;
}
