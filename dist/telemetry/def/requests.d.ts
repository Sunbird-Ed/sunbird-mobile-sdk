import { Environment, InteractSubtype, InteractType, PageId, ImpressionType, ImpressionSubtype, Mode, LogLevel, LogType } from './telemetry-constants';
import { CorrelationData, Rollup, TelemetryObject } from './telemetry-model';
export interface TelemetryInteractRequest {
    interactType: InteractType;
    subType: InteractSubtype;
    env: Environment;
    pageId: PageId;
    object?: TelemetryObject;
    values?: Map<any, any>;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}
export interface TelemetryErrorRequest {
    env: Environment;
    pageId: PageId;
}
export interface TelemetryImpressionRequest {
    impressionType: ImpressionType;
    subType: ImpressionSubtype;
    pageId: PageId;
    env: Environment;
    objectId?: string;
    objectType?: string;
    objectVersion?: string;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}
export interface TelemetryStartRequest {
    pageId: PageId;
    env: Environment;
    mode: Mode;
    object?: TelemetryObject;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}
export interface TelemetryEndRequest {
    objectType: string;
    mode: Mode;
    pageId: PageId;
    env: Environment;
    object?: TelemetryObject;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}
export interface TelemetryLogRequest {
    logLevel: LogLevel;
    message: string;
    env: Environment;
    type: LogType;
    params: Array<any>;
}
