import {DbService} from '../../../native/db';
import {Observable} from 'rxjs';
import {ErrorLoggerService} from '../index';
import {ErrorStackEntry} from '../db/schema';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {GetSystemSettingsRequest, SystemSettingsService} from 'src/services/system-settings';
import {SystemSettingsOrgIds} from '../../system-settings/def/system-settings-org-ids';
import {AppInfo} from '../../../native/app';
import {HttpService} from '../../../native/http';
import {SdkConfig} from '../../../sdk-config';
import {ErrorLoggerConfig} from '../config/error-logger-config';
import {TelemetryErrorRequest} from '../../telemetry';
import {ErrorStack} from '../def/error-stack';
import {ErrorStackMapper} from '../util/error-stack-mapper';
import {ErrorStackSyncHandler} from '../handlers/error-stack-sync-handler';
import {NetworkInfoService} from '../../../native/network-info';
import {ErrorStackSyncRequestDecorator} from '../handlers/error-stack-sync-request-decorator';
import {DeviceInfo} from '../../../native/device';
import {ErrorLogKeys} from '../../../preference-keys';
import {SharedPreferences} from '../../../native/shared-preferences';

@injectable()
export class ErrorLoggerServiceImpl implements ErrorLoggerService {

    private static ERROR_LOG_SYNC_SETTINGS = SystemSettingsOrgIds.ERROR_LOG_SYNC_SETTINGS;
    private readonly errorLoggerConfig: ErrorLoggerConfig;
    private readonly errorStackSyncHandler: ErrorStackSyncHandler;
    private readonly errorStackSyncRequestDecorator: ErrorStackSyncRequestDecorator;

    constructor(
        @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo,
        @inject(InjectionTokens.API_SERVICE) private apiService: HttpService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.NETWORKINFO_SERVICE) private errorLoggerService: NetworkInfoService,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
    ) {
        this.errorLoggerConfig = this.sdkConfig.errorLoggerConfig;
        this.errorStackSyncRequestDecorator = new ErrorStackSyncRequestDecorator(
            this.sdkConfig.httpConfig,
            this.deviceInfo,
            this.appInfo
        );
        this.errorStackSyncHandler = new ErrorStackSyncHandler(
            this.apiService,
            this.dbService,
            this.errorLoggerConfig,
            this.errorLoggerService,
            this.errorStackSyncRequestDecorator
        );
    }

    onInit() {
        return this.sharedPreferences.getString(ErrorLogKeys.KEY_ERROR_LOG_LAST_SYNCED_TIME_STAMP)
            .mergeMap((timestamp) => {
                if (!timestamp) {
                    return this.sharedPreferences.putString(ErrorLogKeys.KEY_ERROR_LOG_LAST_SYNCED_TIME_STAMP, Date.now() + '');
                }

                return Observable.of(undefined);
            });
    }

    logError(request: TelemetryErrorRequest): Observable<undefined> {
        const errorStack: ErrorStack = {
            appver: this.appInfo.getVersionName(),
            pageid: request.pageId,
            ts: Date.now(),
            log: request.stacktrace
        };

        return this.dbService.insert({
            table: ErrorStackEntry.TABLE_NAME,
            modelJson: ErrorStackMapper.mapErrorStackToErrorStackDBEntry(errorStack)
        })
            .mergeMap(() => this.getErrorCount())
            .mergeMap((errorCount) =>
                this.getErrorLogSyncSettings()
                    .map((settings) => ({ ...settings, errorCount }))
            )
            .map(({ errorCount, frequency, bandwidth }) => {
                return {
                    errorCount,
                    errorLogSyncFrequency: frequency,
                    errorLogSyncBandwidth: bandwidth
                };
            })
            .mergeMap(({ errorCount, errorLogSyncFrequency, errorLogSyncBandwidth }) => {
                return this.hasErrorLogSyncFrequencyCrossed(errorCount, errorLogSyncFrequency)
                    .map((shouldSync) => ({
                        shouldSync,
                        errorLogSyncBandwidth
                    }));
            })
            .mergeMap(({ shouldSync, errorLogSyncBandwidth }) => {
                if (shouldSync) {
                    return this.errorStackSyncHandler.handle(errorLogSyncBandwidth)
                        .mergeMap(() =>
                            this.sharedPreferences.putString(ErrorLogKeys.KEY_ERROR_LOG_LAST_SYNCED_TIME_STAMP, Date.now() + ''));
                }

                return Observable.of(undefined);
            });
    }

    private hasErrorLogSyncFrequencyCrossed(errorCount: number, errorLogSyncFrequency: number): Observable<boolean> {
        return this.sharedPreferences.getString(ErrorLogKeys.KEY_ERROR_LOG_LAST_SYNCED_TIME_STAMP)
            .map((timestamp) => parseInt(timestamp!, 10))
            .map((timestamp) => {
                if ((timestamp + errorLogSyncFrequency) < Date.now()) {
                    return true;
                }

                return false;
            });
    }

    private getErrorCount(): Observable<number> {
        return this.dbService.execute(`SELECT COUNT(*) as count FROM ${ErrorStackEntry.TABLE_NAME}`)
            .map((result: ErrorStackEntry.SchemaMap[]) => result[0]['count']);
    }

    private getErrorLogSyncSettings(): Observable<{ frequency: number, bandwidth: number }> {
        const getSystemSettingsRequest: GetSystemSettingsRequest = {
            id: ErrorLoggerServiceImpl.ERROR_LOG_SYNC_SETTINGS
        };

        return this.systemSettingsService.getSystemSettings(getSystemSettingsRequest)
            .map((r) => JSON.parse(r.value));
    }
}
