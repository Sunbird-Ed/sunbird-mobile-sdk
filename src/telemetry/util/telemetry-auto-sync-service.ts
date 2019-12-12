import {Observable} from 'rxjs';
import {TelemetryAutoSyncModes} from './telemetry-auto-sync-modes';

export interface TelemetryAutoSyncService {
    getSyncMode(): Observable<TelemetryAutoSyncModes | undefined>;

    setSyncMode(mode: TelemetryAutoSyncModes): Observable<void>;

    start(intervalTime: number): Observable<undefined>;

    pause(): void;

    continue(): void;
}