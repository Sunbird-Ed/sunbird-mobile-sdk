import { TelemetryAutoSyncModes, TelemetryService } from '..';
import { Observable } from 'rxjs';
import { TelemetryAutoSyncService } from './telemetry-auto-sync-service';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class TelemetryAutoSyncServiceImpl implements TelemetryAutoSyncService {
    private telemetryService;
    private sharedPreferences;
    private static DOWNLOAD_SPEED_TELEMETRY_SYNC_INTERVAL;
    private shouldSync;
    private static generateDownloadSpeedTelemetry;
    constructor(telemetryService: TelemetryService, sharedPreferences: SharedPreferences);
    getSyncMode(): Observable<TelemetryAutoSyncModes | undefined>;
    setSyncMode(mode: TelemetryAutoSyncModes): Observable<void>;
    start(intervalTime: number): Observable<undefined>;
    pause(): void;
    continue(): void;
}
