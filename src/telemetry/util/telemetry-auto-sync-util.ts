import {Observable} from 'rxjs';
import {TelemetryService, TelemetrySyncStat} from '..';

export class TelemetryAutoSyncUtil {
    private shouldSync = false;

    constructor(private telemetryService: TelemetryService) {
    }

    start(interval: number): Observable<TelemetrySyncStat> {
        this.shouldSync = true;

        return Observable
            .interval(interval)
            .filter(() => this.shouldSync)
            .mergeMap(() => this.telemetryService.sync());
    }

    pause(): void {
        this.shouldSync = false;
    }

    continue(): void {
        this.shouldSync = true;
    }
}
