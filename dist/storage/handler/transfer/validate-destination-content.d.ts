import { FileService } from '../../../util/file/def/file-service';
import { AppConfig } from '../../../api/config/app-config';
import { TransferContentContext } from '../transfer-content-handler';
import { Observable } from 'rxjs';
export declare class ValidateDestinationContent {
    private fileService;
    private appConfig;
    constructor(fileService: FileService, appConfig: AppConfig);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private getSubdirectoriesEntries;
    private extractValidContentIdsInDestination;
    private extractManifest;
}
