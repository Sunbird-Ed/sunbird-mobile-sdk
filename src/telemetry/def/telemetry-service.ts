import {TelemetryStat} from './telemetry-stat';
import {TelemetrySyncStat} from './telemetry-sync-stat';
import {Observable} from 'rxjs';
import {
    TelemetryAuditRequest,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryExportRequest,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest, TelemetryInterruptRequest,
    TelemetryLogRequest,
    TelemetryShareRequest,
    TelemetryStartRequest
} from './requests';
import {TelemetryExportResponse} from './response';
import {Context} from './telemetry-model';

export interface TelemetryService {
    saveTelemetry(request: string): Observable<boolean>;

    audit(request: TelemetryAuditRequest): Observable<boolean>;

    start(request: TelemetryStartRequest): Observable<boolean>;

    interact(request: TelemetryInteractRequest): Observable<boolean>;

    impression(request: TelemetryImpressionRequest): Observable<boolean>;

    end(request: TelemetryEndRequest): Observable<boolean>;

    feedback(request: TelemetryFeedbackRequest): Observable<boolean>;

    log(request: TelemetryLogRequest): Observable<boolean>;

    share(request: TelemetryShareRequest): Observable<boolean>;

    error(request: TelemetryErrorRequest): Observable<boolean>;

    interrupt(request: TelemetryInterruptRequest): Observable<boolean>;

    importTelemetry(telemetryImportRequest: TelemetryImportRequest): Observable<boolean>;

    exportTelemetry(telemetryExportRequest: TelemetryExportRequest): Observable<TelemetryExportResponse>;

    getTelemetryStat(): Observable<TelemetryStat>;

    sync(ignoreSyncThreshold?: boolean): Observable<TelemetrySyncStat>;

    resetDeviceRegisterTTL(): Observable<undefined>;

    buildContext(): Observable<Context>;
}
