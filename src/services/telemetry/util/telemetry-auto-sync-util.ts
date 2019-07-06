import {Observable} from 'rxjs';
import {TelemetryService, TelemetrySyncStat} from '../index';

export class TelemetryAutoSyncUtil {
    private shouldSync = false;

    constructor(private telemetryService: TelemetryService) {
    }

    start(interval: number): Observable<TelemetrySyncStat> {
        this.shouldSync = true;

        return Observable
            .interval(interval)
            .filter(() => this.shouldSync)
            .do(() => this.shouldSync = false)
            .mergeMap(() => this.telemetryService.sync()
                .finally(() => this.shouldSync = true));
    }

    pause(): void {
        this.shouldSync = false;
    }

    continue(): void {
        this.shouldSync = true;
    }
}
