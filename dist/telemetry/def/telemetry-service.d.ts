import { TelemetryStat } from './telemetry-stat';
import { TelemetrySyncStat } from './telemetry-sync-stat';
import { CorrelationData, Rollup, TelemetryObject } from './telemetry-model';
import { Observable } from 'rxjs';
import { Environment, ErrorCode, ErrorType, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, LogLevel, LogType, Mode, PageId } from './telemetry-constants';
export interface TelemetryService {
    start(pageId: PageId, env: Environment, mode: Mode, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    interact(interactType: InteractType, subType: InteractSubtype, env: Environment, pageId: PageId, object?: TelemetryObject, values?: {}, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    impression(type: ImpressionType, subtype: ImpressionSubtype, pageid: PageId, env: Environment, objectId?: string, objectType?: string, objectVersion?: string, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    end(type: any, mode: Mode, pageId: PageId, env: Environment, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;
    audit(): void;
    log(logLevel: LogLevel, message: any, env: Environment, type: LogType, params: Array<any>): void;
    error(env: Environment, errCode: ErrorCode, errorType: ErrorType, pageId: PageId, stackTrace: string): void;
    event(telemetry: any): Observable<boolean>;
    import(sourcePath: string): Observable<boolean>;
    export(destPath: string): Observable<boolean>;
    getTelemetryStat(): Observable<TelemetryStat>;
    sync(): Observable<TelemetrySyncStat>;
}
