import {TelemetryStat} from './telemetry-stat';
import {TelemetrySyncStat} from './telemetry-sync-stat';
import {Observable} from 'rxjs';
import {
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryLogRequest,
    TelemetryStartRequest
} from './requests';


export interface TelemetryService {
    start(request: TelemetryStartRequest): Observable<boolean>;

    interact(request: TelemetryInteractRequest): Observable<boolean>;

    impression(request: TelemetryImpressionRequest): Observable<boolean>;

    end(request: TelemetryEndRequest): Observable<boolean>;

    log(request: TelemetryLogRequest): Observable<boolean>;

    error(request: TelemetryErrorRequest): Observable<boolean>;

    import(sourcePath: string): Observable<boolean>;

    export(destinationPath: string): Observable<boolean>;

    getTelemetryStat(): Observable<TelemetryStat>;

    event(telemetry: any): Observable<number>;

    sync(): Observable<TelemetrySyncStat>;
}
