import { DbService } from '../../db';
import { TelemetryDecorator, TelemetryEndRequest, TelemetryErrorRequest, TelemetryImpressionRequest, TelemetryInteractRequest, TelemetryLogRequest, TelemetryService, TelemetryStartRequest, TelemetryStat, TelemetrySyncStat } from '..';
import { Observable } from 'rxjs';
import { ProfileService } from '../../profile';
import { GroupService } from '../../group';
export declare class TelemetryServiceImpl implements TelemetryService {
    private dbService;
    private decorator;
    private profileService;
    private groupService;
    private static readonly KEY_SYNC_TIME;
    constructor(dbService: DbService, decorator: TelemetryDecorator, profileService: ProfileService, groupService: GroupService);
    end({ type, mode, duration, pageId, summaryList, env, objId, objType, objVer, rollup, correlationData }: TelemetryEndRequest): Observable<boolean>;
    error({ errorCode, errorType, stacktrace, pageId, env }: TelemetryErrorRequest): Observable<boolean>;
    impression({ type, subType, pageId, uri, visits, env, objId, objType, objVer, rollup, correlationData }: TelemetryImpressionRequest): Observable<boolean>;
    interact({ type, subType, id, pageId, pos, values, env, rollup, valueMap, correlationData, objId, objType, objVer }: TelemetryInteractRequest): Observable<boolean>;
    log({ type, level, message, pageId, params, env, actorType }: TelemetryLogRequest): Observable<boolean>;
    start({ type, deviceSpecification, loc, mode, duration, pageId, env, objId, objType, objVer, rollup, correlationData }: TelemetryStartRequest): Observable<boolean>;
    import(sourcePath: string): Observable<boolean>;
    export(destPath: string): Observable<boolean>;
    getTelemetryStat(): Observable<TelemetryStat>;
    sync(): Observable<TelemetrySyncStat>;
    event(telemetry: any): Observable<number>;
    private save;
    private getCurrentProfileSession;
    private getCurrentGroupSession;
}
