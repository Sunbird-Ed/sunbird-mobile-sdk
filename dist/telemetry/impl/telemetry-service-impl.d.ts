import { DbService } from '../../db';
import { TelemetryDecorator, TelemetryService, TelemetryStat, TelemetrySyncStat } from '..';
import { CorrelationData, Rollup, TelemetryObject } from '../def/telemetry-model';
import { Observable } from 'rxjs';
export declare class TelemetryServiceImpl implements TelemetryService {
    private dbService;
    private decorator;
    private static readonly KEY_SYNC_TIME;
    constructor(dbService: DbService, decorator: TelemetryDecorator);
    audit(): void;
    end(type: any, mode: any, pageId: any, env: any, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    error(env: any, errCode: any, errorType: any, pageId: any, stackTrace: any): void;
    impression(type: any, subtype: any, pageid: any, env: any, objectId?: string, objectType?: string, objectVersion?: string, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    interact(interactType: any, subType: any, env: any, pageId: any, object?: TelemetryObject, values?: Map<any, any>, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    log(logLevel: any, message: any, env: any, type: any, params: Array<any>): void;
    start(pageId: any, env: any, mode: any, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    event(telemetry: any): Observable<boolean>;
    import(sourcePath: string): Observable<boolean>;
    export(destPath: string): Observable<boolean>;
    getTelemetryStat(): Observable<TelemetryStat>;
    sync(): Observable<TelemetrySyncStat>;
    private save;
}
