import {DbService, InsertQuery} from '../../db';
import {
    ExportTelemetryContext,
    ImportTelemetryContext,
    TelemetryDecorator,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryEvents,
    TelemetryExportRequest,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryLogRequest,
    TelemetryService,
    TelemetryShareRequest,
    TelemetryStartRequest,
    TelemetryStat,
    TelemetrySyncStat
} from '..';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {Observable} from 'rxjs';
import {ProfileService, ProfileSession} from '../../profile';
import {GroupService, GroupSession} from '../../group';
import {TelemetrySyncHandler} from '../handler/telemetry-sync-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService, Response} from '../../api';
import {TelemetryConfig} from '../config/telemetry-config';
import {DeviceInfo} from '../../util/device/def/device-info';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {EventObserver} from '../../events-bus/def/event-observer';
import {FileService} from '../../util/file/def/file-service';
import {CreateTelemetryExportFile} from '../handler/export/create-telemetry-export-file';
import {TelemetryExportResponse} from '../def/response';
import {CopyDatabase} from '../handler/export/copy-database';
import {CreateMetaData} from '../handler/export/create-meta-data';
import {CleanupExportedFile} from '../handler/export/cleanup-exported-file';
import {CleanCurrentDatabase} from '../handler/export/clean-current-database';
import {GenerateShareTelemetry} from '../handler/export/generate-share-telemetry';
import {ValidateTelemetryMetadata} from '../handler/import/validate-telemetry-metadata';

export class TelemetryServiceImpl implements TelemetryService, EventObserver {
    private static readonly KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP = 'telemetry_last_synced_time_stamp';

    constructor(private dbService: DbService,
                private decorator: TelemetryDecorator,
                private profileService: ProfileService,
                private groupService: GroupService,
                private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private telemetryConfig: TelemetryConfig,
                private deviceInfo: DeviceInfo,
                private eventsBusService: EventsBusService,
                private fileService: FileService) {
        this.eventsBusService.registerObserver({namespace: EventNamespace.TELEMETRY, observer: this});
    }

    end({
            type, mode, duration, pageId, summaryList, env,
            objId, objType, objVer, rollup, correlationData
        }: TelemetryEndRequest): Observable<boolean> {
        const end = new TelemetryEvents.End(type, mode, duration, pageId, summaryList, env, objId,
            objType, objVer, rollup, correlationData);
        return this.save(end);
    }

    error({errorCode, errorType, stacktrace, pageId, env}: TelemetryErrorRequest): Observable<boolean> {
        const error = new TelemetryEvents.Error(errorCode, errorType, stacktrace, pageId);
        error.env = env;
        return this.save(error);
    }

    impression({
                   type, subType, pageId, uri, visits, env, objId,
                   objType, objVer, rollup, correlationData
               }: TelemetryImpressionRequest): Observable<boolean> {
        const impression = new TelemetryEvents.Impression(type, subType, pageId, uri, visits, env, objId,
            objType, objVer, rollup!, correlationData);
        return this.save(impression);
    }

    interact({
                 type, subType, id, pageId, pos, values, env, rollup,
                 valueMap, correlationData, objId, objType, objVer
             }: TelemetryInteractRequest): Observable<boolean> {
        const interact = new TelemetryEvents.Interact(type, subType, id, pageId, pos, values, env, objId,
            objType, objVer, rollup, correlationData);
        interact.valueMap = valueMap;
        return this.save(interact);
    }

    log({type, level, message, pageId, params, env, actorType}: TelemetryLogRequest): Observable<boolean> {
        const log = new TelemetryEvents.Log(type, level, message, pageId, params, env, actorType);
        return this.save(log);
    }

    share({dir, type, items}: TelemetryShareRequest): Observable<boolean> {
        const share = new TelemetryEvents.Share(dir, type, []);
        items.forEach((item) => {
            share.addItem(item.type, item.origin, item.identifier, item.pkgVersion, item.transferCount, item.size);
        });
        return this.save(share);
    }

    feedback({rating, comments, env, objId, objType, objVer}: TelemetryFeedbackRequest): Observable<boolean> {
        const feedback = new TelemetryEvents.Feedback(rating, comments, env, objId,
            objType, objVer);
        return this.save(feedback);
    }

    start({
              type, deviceSpecification, loc, mode, duration, pageId, env,
              objId, objType, objVer, rollup, correlationData
          }: TelemetryStartRequest): Observable<boolean> {
        const start = new TelemetryEvents.Start(type, deviceSpecification, loc, mode, duration, pageId, env, objId,
            objType, objVer, rollup, correlationData);
        return this.save(start);
    }

    importTelemetry(importTelemetryRequest: TelemetryImportRequest): Observable<boolean> {
        const importTelemetryContext: ImportTelemetryContext = {
            sourceDBFilePath: importTelemetryRequest.sourceFilePath
        };
        Observable.fromPromise(
            new ValidateTelemetryMetadata(this.dbService).execute(importTelemetryContext).then(() => {
            })
        );
        throw new Error('Method not implemented.');
    }

    exportTelemetry(telemetryExportRequest: TelemetryExportRequest): Observable<TelemetryExportResponse> {
        const exportTelemetryContext: ExportTelemetryContext = {destinationFolder: telemetryExportRequest.destinationFolder};
        const telemetrySyncHandler: TelemetrySyncHandler = new TelemetrySyncHandler(
            this.dbService,
            this.telemetryConfig,
            this.deviceInfo
        );
        return Observable.fromPromise(
            telemetrySyncHandler.processEventsBatch().toPromise().then(() => {
                return new CreateTelemetryExportFile(this.fileService, this.deviceInfo).execute(exportTelemetryContext);
            }).then((exportResponse: Response) => {
                const res: TelemetryExportResponse = {exportedFilePath: 'yep'};
                return new CopyDatabase(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CreateMetaData(this.dbService, this.fileService, this.deviceInfo).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CleanupExportedFile(this.dbService, this.fileService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CleanCurrentDatabase(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CleanCurrentDatabase(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new GenerateShareTelemetry(this.dbService, this).execute(exportResponse.body);
            }).then((exportResponse: Response<ExportTelemetryContext>) => {
                const res: TelemetryExportResponse = {exportedFilePath: exportResponse.body.destinationDBFilePath!};
                return res;
            }));
    }

    getTelemetryStat(): Observable<TelemetryStat> {
        const telemetryCountQuery = `
            SELECT COUNT(*) as TELEMETRY_COUNT
            FROM ${TelemetryEntry.TABLE_NAME}
        `;

        const processedTelemetryCountQuery = `
            SELECT SUM(${TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS}) as PROCESSED_TELEMETRY_COUNT
            FROM ${TelemetryProcessedEntry.TABLE_NAME}
        `;

        return Observable.zip(
            this.dbService.execute(telemetryCountQuery),
            this.dbService.execute(processedTelemetryCountQuery),
            this.keyValueStore.getValue(TelemetryServiceImpl.KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP)
        ).map((results) => {
            const telemetryCount: number = results[0][0]['TELEMETRY_COUNT'];
            const processedTelemetryCount: number = results[1][0]['PROCESSED_TELEMETRY_COUNT'];
            const lastSyncedTimestamp: number = results[2] ? parseInt(results[2]!, 10) : 0;

            return {
                unSyncedEventCount: telemetryCount + processedTelemetryCount,
                lastSyncTime: lastSyncedTimestamp
            };
        });
    }


    sync(): Observable<TelemetrySyncStat> {
        return new TelemetrySyncHandler(
            this.dbService,
            this.telemetryConfig,
            this.deviceInfo,
            this.keyValueStore,
            this.apiService
        ).handle()
            .mergeMap((telemetrySyncStat) =>
                this.keyValueStore.setValue(TelemetryServiceImpl.KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP, telemetrySyncStat.syncTime + '')
                    .mapTo(telemetrySyncStat)
            );
    }

    onEvent(telemetry: TelemetryEvents.Telemetry): Observable<undefined> {
        return this.save(telemetry)
            .mapTo(undefined);
    }

    private save(telemetry: TelemetryEvents.Telemetry): Observable<boolean> {
        return Observable.zip(
            this.profileService.getActiveProfileSession(),
            this.groupService.getActiveGroupSession()
        ).mergeMap((sessions) => {
            const profileSession: ProfileSession | undefined = sessions[0];
            const groupSession: GroupSession | undefined = sessions[1];

            const insertQuery: InsertQuery = {
                table: TelemetryEntry.TABLE_NAME,
                modelJson: this.decorator.prepare(this.decorator.decorate(telemetry, profileSession!.uid,
                    profileSession!.sid, groupSession && groupSession.gid), 1)
            };

            return this.dbService.insert(insertQuery).map((count) => count > 1);
        });
    }


}
