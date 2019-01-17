import { TelemetryStat } from './telemetry-stat';
import { TelemetrySyncStat } from './telemetry-sync-stat';
import { CorrelationData, Rollup, TelemetryObject } from './telemetry-model';
import { Observable } from 'rxjs';
import {
    Environment, ObjectType, Mode, PageId, ImpressionType, LogType, LogLevel, ImpressionSubtype,
    InteractType, InteractSubtype, ErrorCode, ErrorType
} from '..';


export abstract class TelemetryService {

    abstract start(pageId: PageId, env: Environment, mode: Mode, object?: TelemetryObject,
         rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract interact(interactType: InteractType, subType: InteractSubtype, env: Environment, pageId: PageId,
         object?: TelemetryObject, values?: Map<any, any>, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract impression(type: ImpressionType, subtype: ImpressionSubtype, pageid: PageId, env: Environment, objectId?: string,
        objectType?: string, objectVersion?: string, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract end(type, mode: Mode, pageId: PageId, env: Environment, object?: TelemetryObject, rollup?: Rollup,
        corRelationList?: Array<CorrelationData>): void;

    abstract audit(): void;

    abstract log(logLevel: LogLevel, message, env: Environment, type: LogType, params: Array<any>): void;

    abstract error(env: Environment, errCode, errorType, pageId: PageId, stackTrace): void;

    abstract event(telemetry: any): Observable<boolean>;

    abstract import(sourcePath: string): Observable<boolean>;

    abstract export(destPath: string): Observable<boolean>;

    abstract getTelemetryStat(): Observable<TelemetryStat>;

    abstract sync(): Observable<TelemetrySyncStat>;

}
