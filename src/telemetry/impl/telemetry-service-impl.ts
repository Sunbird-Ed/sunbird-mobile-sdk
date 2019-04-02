import {DbService, InsertQuery} from '../../db';
import {
    ExportTelemetryContext,
    ImportTelemetryContext,
    SunbirdTelemetry,
    TelemetryAuditRequest,
    TelemetryDecorator,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryExportRequest,
    TelemetryExportResponse,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryInterruptRequest,
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
import {DeviceInfo} from '../../util/device';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {FileService} from '../../util/file/def/file-service';
import {CreateTelemetryExportFile} from '../handler/export/create-telemetry-export-file';
import {CopyDatabase} from '../handler/export/copy-database';
import {CreateMetaData} from '../handler/export/create-meta-data';
import {CleanupExportedFile} from '../handler/export/cleanup-exported-file';
import {CleanCurrentDatabase} from '../handler/export/clean-current-database';
import {GenerateShareTelemetry} from '../handler/export/generate-share-telemetry';
import {ValidateTelemetryMetadata} from '../handler/import/validate-telemetry-metadata';
import {TelemetryEventType} from '../def/telemetry-event';
import {TransportProcessedTelemetry} from '../handler/import/transport-processed-telemetry';
import {UpdateImportedTelemetryMetadata} from '../handler/import/update-imported-telemetry-metadata';
import {GenerateImportTelemetryShare} from '../handler/import/generate-import-telemetry-share';

export class TelemetryServiceImpl implements TelemetryService {
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
    }

    saveTelemetry(request: string): Observable<boolean> {
        return Observable.defer(() => {
            try {
                const telemetry: SunbirdTelemetry.Telemetry = JSON.parse(request);
                return this.decorateAndPersist(telemetry);
            } catch (e) {
                console.error(e);
                return Observable.of(false);
            }
        });
    }

    audit({env, actor, currentState, updatedProperties, objId, objType, objVer}: TelemetryAuditRequest): Observable<boolean> {
        const audit = new SunbirdTelemetry.Audit(env, actor, currentState, updatedProperties, objId, objType, objVer);
        return this.decorateAndPersist(audit);
    }

    end({
            type, mode, duration, pageId, summaryList, env,
            objId, objType, objVer, rollup, correlationData
        }: TelemetryEndRequest): Observable<boolean> {
        const end = new SunbirdTelemetry.End(type, mode, duration, pageId, summaryList, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(end);
    }

    error({errorCode, errorType, stacktrace, pageId}: TelemetryErrorRequest): Observable<boolean> {
        const error = new SunbirdTelemetry.Error(errorCode, errorType, stacktrace, pageId);
        return this.decorateAndPersist(error);
    }

    impression({
                   type, subType, pageId, visits, env, objId,
                   objType, objVer, rollup, correlationData
               }: TelemetryImpressionRequest): Observable<boolean> {
        const impression = new SunbirdTelemetry.Impression(type, subType, pageId, visits, env, objId,
            objType, objVer, rollup!, correlationData);
        return this.decorateAndPersist(impression);
    }

    interact({
                 type, subType, id, pageId, pos, env, rollup,
                 valueMap, correlationData, objId, objType, objVer
             }: TelemetryInteractRequest): Observable<boolean> {
        const interact = new SunbirdTelemetry.Interact(type, subType, id, pageId, pos, valueMap, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(interact);
    }

    log({type, level, message, pageId, params, env, actorType}: TelemetryLogRequest): Observable<boolean> {
        const log = new SunbirdTelemetry.Log(type, level, message, pageId, params, env, actorType);
        return this.decorateAndPersist(log);
    }

    share({dir, type, items}: TelemetryShareRequest): Observable<boolean> {
        const share = new SunbirdTelemetry.Share(dir, type, []);
        items.forEach((item) => {
            share.addItem(item.type, item.origin, item.identifier, item.pkgVersion, item.transferCount, item.size);
        });
        return this.decorateAndPersist(share);
    }

    feedback({rating, comments, env, objId, objType, objVer}: TelemetryFeedbackRequest): Observable<boolean> {
        const feedback = new SunbirdTelemetry.Feedback(rating, comments, env, objId,
            objType, objVer);
        return this.decorateAndPersist(feedback);
    }

    start({
              type, deviceSpecification, loc, mode, duration, pageId, env,
              objId, objType, objVer, rollup, correlationData
          }: TelemetryStartRequest): Observable<boolean> {
        const start = new SunbirdTelemetry.Start(type, deviceSpecification, loc, mode, duration, pageId, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(start);
    }


    interrupt({type, pageId}: TelemetryInterruptRequest): Observable<boolean> {
        const interrupt = new SunbirdTelemetry.Interrupt(type, pageId);
        return this.decorateAndPersist(interrupt);
    }

    importTelemetry(importTelemetryRequest: TelemetryImportRequest): Observable<boolean> {
        const importTelemetryContext: ImportTelemetryContext = {
            sourceDBFilePath: importTelemetryRequest.sourceFilePath
        };
        return Observable.fromPromise(
            new ValidateTelemetryMetadata(this.dbService).execute(importTelemetryContext).then((importResponse: Response) => {
                return new TransportProcessedTelemetry(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new UpdateImportedTelemetryMetadata(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new UpdateImportedTelemetryMetadata(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new GenerateImportTelemetryShare(this.dbService, this).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return true;
            }).catch((e) => {
                console.error(e);
                return false;
            })
        );
    }

    exportTelemetry(telemetryExportRequest: TelemetryExportRequest): Observable<TelemetryExportResponse> {
        const exportTelemetryContext: ExportTelemetryContext = {destinationFolder: telemetryExportRequest.destinationFolder};
        const telemetrySyncHandler: TelemetrySyncHandler = new TelemetrySyncHandler(
            this.dbService,
            this.telemetryConfig,
            this.deviceInfo
        );
        return Observable.fromPromise(
            telemetrySyncHandler.processEventsBatch().expand((processedEventsCount: number) =>
                processedEventsCount ? telemetrySyncHandler.processEventsBatch() : Observable.empty()
            ).toPromise().then(() => {
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

    private decorateAndPersist(telemetry: SunbirdTelemetry.Telemetry): Observable<boolean> {
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

            return this.dbService.insert(insertQuery)
                .do(() => this.eventsBusService.emit({
                    namespace: EventNamespace.TELEMETRY,
                    event: {
                        type: TelemetryEventType.SAVE,
                        payload: telemetry
                    }
                }))
                .map((count) => count > 1);
        });
    }


}
