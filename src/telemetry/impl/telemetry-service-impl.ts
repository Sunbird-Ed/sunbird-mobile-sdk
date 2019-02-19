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
import {Observable, Observer} from 'rxjs';
import Telemetry = TelemetryEvents.Telemetry;
import {ProfileService, ProfileSession} from '../../profile';
import {GroupService} from '../../group';

export class TelemetryServiceImpl implements TelemetryService {

    private static readonly KEY_SYNC_TIME = 'telemetry_sync_time';

    constructor(private dbService: DbService, private decorator: TelemetryDecorator,
                private profileService: ProfileService,
                private groupService: GroupService) {
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
        const telemetryEventCountQuery = 'select count(*) from ' + TelemetryEntry.TABLE_NAME;
        const processedTelemetryEventCountQuery = 'select sum(' +
            TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + ') from ' + TelemetryProcessedEntry.TABLE_NAME;
        let telemetryEventCount = 0;
        let processedTelemetryEventCount = 0;
        const syncStat = new TelemetryStat();

        return Observable.create((observer: Observer<TelemetryStat>) => {
            this.dbService.execute(telemetryEventCountQuery)
                .toPromise()
                .then(value => {
                    telemetryEventCount = value[0];
                    return this.dbService.execute(processedTelemetryEventCountQuery);
                })
                .then(value => {
                    processedTelemetryEventCount = value[0];
                    syncStat.unSyncedEventCount = telemetryEventCount + processedTelemetryEventCount;
                    const syncTime = localStorage.getItem(TelemetryServiceImpl.KEY_SYNC_TIME);
                    if (syncTime !== null) {
                        syncStat.lastSyncTime = parseInt(syncTime, 10);
                    }

                    observer.next(syncStat);
                    observer.complete();
                })
                .catch(error => {
                    observer.error(error);
                });
        });
    }


    sync(): Observable<TelemetrySyncStat> {
        throw new Error('Method not implemented.');
    }

    event(telemetry: any): Observable<number> {
        throw new Error('Method not implemented.');
    }

    private save(telemetry: any): Observable<boolean> {
        return Observable.zip(
            this.getCurrentProfileSession(),
            this.getCurrentProfileSession()
        ).mergeMap((r) => {
            const profileSession: ProfileSession | undefined = r[0];
            const groupSession: ProfileSession | undefined = r[1];

            const insertQuery: InsertQuery = {
                table: TelemetryEntry.TABLE_NAME,
                modelJson: this.decorator.prepare(this.decorator.decorate(telemetry, profileSession!, groupSession!))
            };

            return this.dbService.insert(insertQuery).map((count) => count > 1);
        });
    }

    private getCurrentProfileSession(): Promise<ProfileSession | undefined> {
        return this.profileService.getActiveProfileSession().toPromise();
    }

    private getCurrentGroupSession(): Promise<ProfileSession | undefined> {
        return this.profileService.getActiveProfileSession().toPromise();
    }

}
