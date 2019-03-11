import {TelemetryStat} from './telemetry-stat';
import {TelemetrySyncStat} from './telemetry-sync-stat';
import {Observable} from 'rxjs';
import {
    TelemetryEndRequest,
    TelemetryErrorRequest, TelemetryExportRequest, TelemetryFeedbackRequest, TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryLogRequest, TelemetryShareRequest,
    TelemetryStartRequest
} from './requests';
import {Response} from '../../api';
import {TelemetryExportResponse} from './response';

export interface TelemetryService {
    start(request: TelemetryStartRequest): Observable<boolean>;

    interact(request: TelemetryInteractRequest): Observable<boolean>;

    impression(request: TelemetryImpressionRequest): Observable<boolean>;

    end(request: TelemetryEndRequest): Observable<boolean>;

    feedback(request: TelemetryFeedbackRequest): Observable<boolean>;

    log(request: TelemetryLogRequest): Observable<boolean>;

    share(request: TelemetryShareRequest): Observable<boolean>;

    error(request: TelemetryErrorRequest): Observable<boolean>;

    importTelemetry(telemetryImportRequest: TelemetryImportRequest): Observable<boolean>;

    exportTelemetry(telemetryExportRequest: TelemetryExportRequest): Observable<TelemetryExportResponse>;

    getTelemetryStat(): Observable<TelemetryStat>;

    sync(): Observable<TelemetrySyncStat>;
}
