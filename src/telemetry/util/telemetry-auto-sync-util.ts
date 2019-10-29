import {Observable} from 'rxjs';
import {InteractSubType, InteractType, TelemetryService, TelemetrySyncStat} from '..';
import {TelemetryLogger} from './telemetry-logger';

export class TelemetryAutoSyncUtil {
    private shouldSync = false;

    private static async generateDownloadSpeedTelemetry(interval: number): Promise<void> {
        const downloadSpeedLog: DownloadSpeedLog =  await new Promise<any>((resolve, reject) => {
            if (downloadManager.fetchSpeedLog) {
                downloadManager.fetchSpeedLog(resolve, reject);
            } else {
                cordova['exec'](resolve, reject, 'DownloadManagerPlugin', 'fetchSpeedLog', []);
            }
        });

        const rangeMap = {
            '32': '0-32',
            '64': '32-64',
            '128': '128-256',
            '256': '256-512',
            '512': '512-1024',
            '1024': '1024-1536',
            '1536': '1536-2048',
            '2048': '2048-2560',
            '2560': '2560-2072',
            '3072': '3072-3584',
            '3584': '3584-above',
        };

        const valueMap = {
            duration: interval,
            totalKiloBytesDownloaded: downloadSpeedLog.totalKBdownloaded,
            distributionInKiloBytesPerSecond: Object.keys(rangeMap).reduce<{[key: string]: number}>((acc, key) => {
                if (downloadSpeedLog.distributionInKiloBytesPerSecond[key]) {
                    acc[rangeMap[key]] = downloadSpeedLog.distributionInKiloBytesPerSecond[key];
                } else {
                    acc[rangeMap[key]] = 0;
                }

                return acc;
            }, {})
        };

        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.NETWORK_SPEED,
            env: 'sdk',
            pageId: 'sdk',
            valueMap
        }).mapTo(undefined).toPromise();
    }

    constructor(private telemetryService: TelemetryService) {
    }

    start(interval: number): Observable<TelemetrySyncStat> {
        this.shouldSync = true;

        return Observable
            .interval(interval)
            .do(() => TelemetryAutoSyncUtil.generateDownloadSpeedTelemetry(interval))
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
