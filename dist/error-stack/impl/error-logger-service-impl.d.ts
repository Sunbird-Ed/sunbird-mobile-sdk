import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { ErrorLoggerService } from '../def/error-logger-service';
import { ErrorStack } from '../def/error-stack';
import { SystemSettingsService } from 'src/system-settings';
import { AppInfo } from '../../util/app';
export declare class ErrorLoggerServiceImpl implements ErrorLoggerService {
    private systemSettingsService;
    private dbService;
    private appInfo;
    private static ERROR_STACK_COUNT;
    constructor(systemSettingsService: SystemSettingsService, dbService: DbService, appInfo: AppInfo);
    static hasErrorSynchresholdCrossed(errorCount: number, errorSyncThreshold: number): boolean;
    logError(errorStack: ErrorStack): Observable<undefined>;
    clearLogs(): Observable<undefined>;
    private getErrorCount;
}
