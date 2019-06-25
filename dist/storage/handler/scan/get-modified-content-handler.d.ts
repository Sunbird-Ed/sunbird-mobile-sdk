import { FileService } from '../../../util/file/def/file-service';
import { ScanContentContext } from '../../def/scan-requests';
import { DbService } from '../../../db';
import { Observable } from 'rxjs';
export declare class GetModifiedContentHandler {
    private fileService;
    private dbService;
    constructor(fileService: FileService, dbService: DbService);
    execute(context: ScanContentContext): Observable<ScanContentContext>;
    private doesDestinationStorageExist;
    private getContentsInDb;
    private getNewlyAddedContents;
    private getDeletedContents;
    private getFolderList;
}
