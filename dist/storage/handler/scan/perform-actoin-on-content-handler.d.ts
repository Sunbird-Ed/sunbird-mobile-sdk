import { ScanContentContext } from '../../def/scan-requests';
import { StorageHandler } from '../storage-handler';
import { Observable } from 'rxjs';
export declare class PerformActoinOnContentHandler {
    private storageHandler;
    constructor(storageHandler: StorageHandler);
    exexute(context: ScanContentContext): Observable<ScanContentContext>;
}
