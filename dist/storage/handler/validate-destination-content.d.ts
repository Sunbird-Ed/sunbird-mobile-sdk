import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { AppConfig } from '../../api/config/app-config';
import { TransferContentContext } from './transfer-content-handler';
export declare class ValidateDestinationContent {
    private fileService;
    private appConfig;
    private static readonly MANIFEST_FILE_NAME;
    constructor(fileService: FileService, appConfig: AppConfig);
    execute(context: TransferContentContext): Observable<TransferContentContext>;
    private getSubdirectoriesEntries;
    private extractValidContentIdsInDestination;
    private extractManifest;
    private validateManifest;
    private validateItems;
}
