import { Observable } from 'rxjs';
import { TelemetryService, TelemetrySyncStat } from '..';
export declare class TelemetryAutoSyncUtil {
    private telemetryService;
    private shouldSync;
    private static generateDownloadSpeedTelemetry;
    constructor(telemetryService: TelemetryService);
    start(interval: number): Observable<TelemetrySyncStat>;
    pause(): void;
    continue(): void;
}
