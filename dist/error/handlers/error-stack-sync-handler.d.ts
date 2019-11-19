import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { DbService } from '../../db';
import { ErrorLoggerConfig } from '../config/error-logger-config';
import { NetworkInfoService } from '../../util/network';
import { ErrorStackSyncRequestDecorator } from './error-stack-sync-request-decorator';
export declare class ErrorStackSyncHandler {
    private apiService;
    private dbService;
    private errorLoggerConfig;
    private networkInfoService;
    private errorStackSyncRequestDecorator;
    constructor(apiService: ApiService, dbService: DbService, errorLoggerConfig: ErrorLoggerConfig, networkInfoService: NetworkInfoService, errorStackSyncRequestDecorator: ErrorStackSyncRequestDecorator);
    handle(errorSyncBandwidth: number): Observable<undefined>;
    private processBatch;
    private getErrorStackBatch;
    private clearLogs;
    private sync;
}
