import {InteractSubType, InteractType, TelemetryAutoSyncModes, TelemetryService} from '..';
import {TelemetryLogger} from './telemetry-logger';
import {interval, Observable, of} from 'rxjs';
import {catchError, filter, map, mapTo, tap} from 'rxjs/operators';
import {TelemetryAutoSyncService} from './telemetry-auto-sync-service';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryKeys} from '../../preference-keys';


export class TelemetryAutoSyncServiceImpl implements TelemetryAutoSyncService {
    private static DOWNLOAD_SPEED_TELEMETRY_SYNC_INTERVAL = 60 * 1000;
    private shouldSync = false;

    private static async generateDownloadSpeedTelemetry(intervalTime: number): Promise<void> {
        const downloadSpeedLog: DownloadSpeedLog = await new Promise<any>((resolve, reject) => {
            if (downloadManager.fetchSpeedLog) {
                downloadManager.fetchSpeedLog((_, r) => resolve(r), reject);
            } else {
                cordova['exec'](resolve, reject, 'DownloadManagerPlugin', 'fetchSpeedLog', []);
            }
        });

        const rangeMap = {
            '32': '0-32',
            '64': '32-64',
            '128': '64-128',
            '256': '128-256',
            '512': '256-512',
            '1024': '512-1024',
            '1536': '1024-1536',
            '2048': '1536-2048',
            '2560': '2048-2560',
            '3072': '2560-3072',
            '3584': '3072-3584',
            '4096': '3584-above'
        };

        if (!Object.keys(downloadSpeedLog?.distributionInKBPS).length) {
            return undefined;
        }

        const valueMap = {
            duration: intervalTime / 1000,
            totalKBDownloaded: downloadSpeedLog?.totalKBdownloaded,
            distributionInKBPS: Object.keys(rangeMap).reduce<{ [key: string]: number }>((acc, key) => {
                if (downloadSpeedLog?.distributionInKBPS[key]) {
                    acc[rangeMap[key]] = downloadSpeedLog.distributionInKBPS[key];
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
            id: 'sdk',
            valueMap
        }).pipe(
            mapTo(undefined)
        ).toPromise();
    }

    constructor(
        private telemetryService: TelemetryService,
        private sharedPreferences: SharedPreferences
    ) {
    }

    getSyncMode(): Observable<TelemetryAutoSyncModes | undefined> {
        return this.sharedPreferences.getString(TelemetryKeys.KEY_AUTO_SYNC_MODE).pipe(
            map((v) => v as TelemetryAutoSyncModes)
        );
    }

    setSyncMode(mode: TelemetryAutoSyncModes): Observable<void> {
        return this.sharedPreferences.putString(TelemetryKeys.KEY_AUTO_SYNC_MODE, mode);
    }

    start(intervalTime: number): Observable<undefined> {
        this.shouldSync = true;

        return interval(intervalTime).pipe(
            tap((iteration: number) => {
                const timeCovered = iteration * intervalTime;

                if (timeCovered % TelemetryAutoSyncServiceImpl.DOWNLOAD_SPEED_TELEMETRY_SYNC_INTERVAL === 0) {
                    if(window.device.platform.toLowerCase() !== "ios") {
                        TelemetryAutoSyncServiceImpl.generateDownloadSpeedTelemetry(intervalTime);
                    }
                }
            }),
            filter(() => this.shouldSync),
            tap(() => this.telemetryService.sync().pipe(
                tap((stat) => {
                    console.log('AUTO_SYNC_INVOKED_SYNC----------------------------------------------', stat);
                }),
                catchError((e) => {
                    console.error(e);
                    return of(undefined);
                })
            ).toPromise()),
            mapTo(undefined)
        );
    }

    pause(): void {
        this.shouldSync = false;
    }

    continue(): void {
        this.shouldSync = true;
    }
}
