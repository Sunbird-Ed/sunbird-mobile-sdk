import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { ErrorLoggerService } from '../def/error-logger-service';
import { ErrorStack } from '../def/error-stack';
import { ErrorStackEntry } from '../db/schema';
import { Container, inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { ErrorStackMapper } from '../util/error-stack-mapper';
import { mapTo } from 'rxjs/operators';
import { SystemSettingsService, GetSystemSettingsRequest } from 'src/system-settings';
import { SystemSettingsOrgIds } from '../../system-settings/def/system-settings-org-ids';
import { AppInfo } from '../../util/app';


@injectable()
export class ErrorLoggerServiceImpl implements ErrorLoggerService {
    private static ERROR_STACK_COUNT = SystemSettingsOrgIds.ERROR_STACK_COUNT;

    constructor(
        @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo) {
    }

    static hasErrorSynchresholdCrossed(errorCount: number, errorSyncThreshold: number): boolean {
        return errorCount >= errorSyncThreshold;
    }

    logError(errorStack: ErrorStack): Observable<undefined> {
        errorStack.appVersion = this.appInfo.getVersionName();
        this.dbService.insert({
            table: ErrorStackEntry.TABLE_NAME,
            modelJson: ErrorStackMapper.mapErrorStackToErrorStackDBEntry(errorStack)
        });
        return this.getErrorCount().mergeMap((result) => {
            const getSystemSettingsRequest: GetSystemSettingsRequest = {
                id: ErrorLoggerServiceImpl.ERROR_STACK_COUNT
            };
            return this.systemSettingsService.getSystemSettings(getSystemSettingsRequest)
                .map((r) => r.value)
                .mergeMap((errorSyncThreshold) => {
                    if (ErrorLoggerServiceImpl.hasErrorSynchresholdCrossed(result[0].count, Number(errorSyncThreshold))) {
                        return this.clearLogs();
                    }

                  return Observable.of(undefined);
                });
        }).mapTo(undefined);
    }

    clearLogs(): Observable<undefined> {
        return this.dbService.execute(`DELETE FROM ${ErrorStackEntry.TABLE_NAME}`)
            .mapTo(undefined);
    }

    private getErrorCount(): Observable<number> {
        return this.dbService.execute(`SELECT COUNT(*) as count FROM ${ErrorStackEntry.TABLE_NAME}`).map((result) => result);
    }
}
