import {
    Environment,
    ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType,
    LogLevel,
    LogType,
    Mode,
    PageId
} from './telemetry-constants';
import {CorrelationData, Rollup, TelemetryObject} from './telemetry-model';

export class TelemetryInteractRequest {
    interactType: InteractType;
    subType: InteractSubtype;
    env: Environment;
    pageId: PageId;
    object?: TelemetryObject;
    values?: Map<any, any>;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}

export class TelemetryErrorRequest {
    env: Environment;
    pageId: PageId;
}

export class TelemetryImpressionRequest {
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

export class TelemetryStartRequest {
    pageId: PageId;
    env: Environment;
    mode: Mode;
    object?: TelemetryObject;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}

export class TelemetryEndRequest {
    objectType: string;
    mode: Mode;
    pageId: PageId;
    env: Environment;
    object?: TelemetryObject;
    rollup?: Rollup;
    corRelationList?: Array<CorrelationData>;
}

export class TelemetryLogRequest {
    logLevel: LogLevel;
    message: string;
    env: Environment;
    type: LogType;
    params: Array<any>;
}

