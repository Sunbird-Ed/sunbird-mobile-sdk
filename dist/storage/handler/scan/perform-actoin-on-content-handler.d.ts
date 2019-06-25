import { ScanContentContext } from '../../def/scan-requests';
import { Observable } from 'rxjs';
import { StorageHandler } from '../storage-handler';
export declare class PerformActoinOnContentHandler {
    private storageHandler;
    constructor(storageHandler: StorageHandler);
    exexute(context: ScanContentContext): Observable<ScanContentContext>;
}
