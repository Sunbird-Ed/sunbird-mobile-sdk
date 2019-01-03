import {TelemetryStat} from './telemetry-stat';
import {TelemetrySyncStat} from './telemetry-sync-stat';
import {CorrelationData, Rollup, TelemetryObject} from './telemetry-model';


export abstract class TelemetryService {

    abstract start(pageId, env, mode, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract interact(interactType, subType, env, pageId, object?: TelemetryObject, values?: Map<any, any>,
                      rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract impression(type, subtype, pageid, env, objectId?: string, objectType?: string,
                        objectVersion?: string, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract end(type, mode, pageId, env, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void;

    abstract audit(): void;

    abstract log(logLevel, message, env, type, params: Array<any>): void;

    abstract error(env, errCode, errorType, pageId, stackTrace): void;

    abstract event(telemetry: any): Promise<boolean>;

    abstract import(sourcePath: string): Promise<boolean>;

    abstract export(destPath: string): Promise<boolean>;

    abstract getTelemetryStat(): Promise<TelemetryStat>;

    abstract sync(): Promise<TelemetrySyncStat>;

}