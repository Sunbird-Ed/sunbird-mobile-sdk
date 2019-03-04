import {TelemetryStat} from './telemetry-stat';
import {TelemetrySyncStat} from './telemetry-sync-stat';
import {Observable} from 'rxjs';
import {
    TelemetryEndRequest,
    TelemetryErrorRequest, TelemetryFeedbackRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryLogRequest, TelemetryShareRequest,
    TelemetryStartRequest
} from './requests';


export interface TelemetryService {
    start(request: TelemetryStartRequest): Observable<boolean>;

    interact(request: TelemetryInteractRequest): Observable<boolean>;

    impression(request: TelemetryImpressionRequest): Observable<boolean>;

    end(request: TelemetryEndRequest): Observable<boolean>;

    feedback(request: TelemetryFeedbackRequest): Observable<boolean>;

    log(request: TelemetryLogRequest): Observable<boolean>;

    share(request: TelemetryShareRequest): Observable<boolean>;

    error(request: TelemetryErrorRequest): Observable<boolean>;

    import(sourcePath: string): Observable<boolean>;

    export(destinationPath: string): Observable<boolean>;

    getTelemetryStat(): Observable<TelemetryStat>;

    sync(): Observable<TelemetrySyncStat>;
}
