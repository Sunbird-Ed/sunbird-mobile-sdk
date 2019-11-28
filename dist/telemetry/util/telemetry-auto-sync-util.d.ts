import { TelemetryService, TelemetrySyncStat } from '..';
import { Observable } from 'rxjs';
export declare class TelemetryAutoSyncUtil {
    private telemetryService;
    private shouldSync;
    private static generateDownloadSpeedTelemetry;
    constructor(telemetryService: TelemetryService);
    start(intervalTime: number): Observable<TelemetrySyncStat>;
    pause(): void;
    continue(): void;
}
