import {
    Context, CorrelationData,
    TelemetryAuditRequest,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryInterruptRequest,
    TelemetryLogRequest,
    TelemetryService, TelemetryShareRequest, TelemetryStartRequest,
    TelemetryStat, TelemetrySyncRequest, TelemetrySyncStat
} from '..';
import {inject, injectable} from 'inversify';
import {TelemetryAutoSyncServiceImpl} from '../util/telemetry-auto-sync-service-impl';
import {InjectionTokens} from '../../injection-tokens';
import {SharedPreferences} from '../../util/shared-preferences';
import {Observable, of} from 'rxjs';

@injectable()
export class TelemetryServiceStubImpl implements TelemetryService {
    private telemetryAutoSyncService?: TelemetryAutoSyncServiceImpl;

    get autoSync() {
        if (!this.telemetryAutoSyncService) {
            this.telemetryAutoSyncService = new TelemetryAutoSyncServiceImpl(this, this.sharedPreferences);
        }

        return this.telemetryAutoSyncService;
    }


    constructor(
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences
    ) {
    }

    audit(request: TelemetryAuditRequest): Observable<boolean> {
        return of(true);
    }

    buildContext(): Observable<Context> {
        return of({} as any);
    }

    end(request: TelemetryEndRequest): Observable<boolean> {
        return of(true);
    }

    error(request: TelemetryErrorRequest): Observable<boolean> {
        return of(true);
    }

    feedback(request: TelemetryFeedbackRequest): Observable<boolean> {
        return of(true);
    }

    getTelemetryStat(): Observable<TelemetryStat> {
        return of({
            unSyncedEventCount: 0,
            lastSyncTime: 0
        });
    }

    importTelemetry(telemetryImportRequest: TelemetryImportRequest): Observable<boolean> {
        return of(true);
    }

    impression(request: TelemetryImpressionRequest): Observable<boolean> {
        return of(true);
    }

    interact(request: TelemetryInteractRequest): Observable<boolean> {
        return of(true);
    }

    interrupt(request: TelemetryInterruptRequest): Observable<boolean> {
        return of(true);
    }

    lastSyncedTimestamp(): Observable<number | undefined> {
        return of(Date.now());
    }

    log(request: TelemetryLogRequest): Observable<boolean> {
        return of(true);
    }

    onInit(): Observable<undefined> {
        return of(undefined);
    }

    preInit(): Observable<undefined> {
        return of(undefined);
    }

    resetDeviceRegisterTTL(): Observable<undefined> {
        return of(undefined);
    }

    saveTelemetry(request: string): Observable<boolean> {
        return of(true);
    }

    share(request: TelemetryShareRequest): Observable<boolean> {
        return of(true);
    }

    start(request: TelemetryStartRequest): Observable<boolean> {
        return of(true);
    }

    sync(telemetrySyncRequest?: TelemetrySyncRequest): Observable<TelemetrySyncStat> {
        return of({
            syncedEventCount: 0,
            syncTime: 0,
            syncedFileSize: 0,
        });
    }

    updateCampaignParameters(params: CorrelationData[]) {
    }
}
