import {DbService, InsertQuery} from '../../db';
import {
    TelemetryDecorator,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryEvents,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryLogRequest,
    TelemetryService,
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
import {ApiService} from '../../api';
import {TelemetryConfig} from '../config/telemetry-config';
import {DeviceInfo} from '../../util/device/def/device-info';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {EventDelegate} from '../../events-bus/def/event-delegate';

export class TelemetryServiceImpl implements TelemetryService, EventDelegate {
    private static readonly KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP = 'telemetry_last_synced_time_stamp';

    constructor(private dbService: DbService,
                private decorator: TelemetryDecorator,
                private profileService: ProfileService,
                private groupService: GroupService,
                private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private telemetryConfig: TelemetryConfig,
                private deviceInfo: DeviceInfo,
                private eventsBusService: EventsBusService) {
        this.eventsBusService.registerDelegate({namespace: EventNamespace.TELEMETRY, delegate: this});
    }

    end({
            type, mode, duration, pageId, summaryList, env,
            objId, objType, objVer, rollup, correlationData
        }: TelemetryEndRequest): Observable<boolean> {
        const end = new TelemetryEvents.End(type, mode, duration, pageId, summaryList);
        end.env = env;
        end.objId = objId;
        end.objType = objType;
        end.objId = objId;
        end.objVer = objVer;
        end.rollup = rollup;
        end.correlationData = correlationData;
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
        const impression = new TelemetryEvents.Impression(type, subType, pageId, uri, visits);
        impression.env = env;
        impression.objId = objId;
        impression.objType = objType;
        impression.objVer = objVer;
        impression.rollup = rollup;
        impression.correlationData = correlationData;
        return this.save(impression);
    }

    interact({
                 type, subType, id, pageId, pos, values, env, rollup,
                 valueMap, correlationData, objId, objType, objVer
             }: TelemetryInteractRequest): Observable<boolean> {
        const interact = new TelemetryEvents.Interact(type, subType, id, pageId, pos, values);
        interact.env = env;
        interact.rollup = rollup;
        interact.valueMap = valueMap;
        interact.correlationData = correlationData;
        interact.objId = objId;
        interact.objType = objType;
        interact.objVer = objVer;
        return this.save(interact);
    }

    log({type, level, message, pageId, params, env, actorType}: TelemetryLogRequest): Observable<boolean> {
        const log = new TelemetryEvents.Log(type, level, message, pageId, params);
        log.env = env;
        log.actorType = actorType;
        return this.save(log);
    }

    start({
              type, deviceSpecification, loc, mode, duration, pageId, env,
              objId, objType, objVer, rollup, correlationData
          }: TelemetryStartRequest): Observable<boolean> {
        const start = new TelemetryEvents.Start(type, deviceSpecification, loc, mode, duration, pageId);
        start.env = env;
        start.objId = objId;
        start.objType = objType;
        start.objVer = objVer;
        start.rollup = rollup;
        start.correlationData = correlationData;
        return this.save(start);
    }

    import(sourcePath: string): Observable<boolean> {
        throw new Error('Method not implemented.');
    }

    export(destPath: string): Observable<boolean> {
        throw new Error('Method not implemented.');
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
            this.keyValueStore,
            this.dbService,
            this.apiService,
            this.telemetryConfig,
            this.deviceInfo
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
