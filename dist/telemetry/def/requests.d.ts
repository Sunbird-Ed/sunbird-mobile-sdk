import { Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, LogLevel, LogType, PageId } from './telemetry-constants';
import { CorrelationData, DeviceSpecification, Rollup, Visit } from './telemetry-model';
export declare class TelemetryInteractRequest {
    type: InteractType;
    subType: InteractSubtype;
    id: string;
    pageId: PageId;
    pos: Array<{
        [index: string]: string;
    }>;
    values: Array<{
        [index: string]: any;
    }>;
    env: Environment;
    rollup: Rollup;
    valueMap: {
        [index: string]: any;
    };
    correlationData: Array<CorrelationData>;
    objId: string;
    objType: string;
    objVer: string;
}
export declare class TelemetryErrorRequest {
    errorCode: string;
    errorType: string;
    stacktrace: string;
    pageId: PageId;
    env: Environment;
}
export declare class TelemetryImpressionRequest {
    type: ImpressionType;
    subType: ImpressionSubtype;
    pageId: PageId;
    uri: string;
    visits: Visit[];
    env: Environment;
    objId: string;
    objType: string;
    objVer: string;
    correlationData: Array<CorrelationData>;
    rollup?: Rollup;
}
export declare class TelemetryStartRequest {
    type: string;
    deviceSpecification: DeviceSpecification;
    loc: string;
    mode: string;
    duration: number;
    pageId: PageId;
    env: Environment;
    objId: string;
    objType: string;
    objVer: string;
    rollup: Rollup;
    correlationData: Array<CorrelationData>;
}
export declare class TelemetryEndRequest {
    env: Environment;
    type: string;
    mode: string;
    duration: number;
    pageId: PageId;
    objId: string;
    objType: string;
    objVer: string;
    rollup: Rollup;
    summaryList: Array<{
        [index: string]: any;
    }>;
    correlationData: Array<CorrelationData>;
}
export declare class TelemetryLogRequest {
    type: LogType;
    level: LogLevel;
    message: string;
    pageId: PageId;
    params: Array<{
        [index: string]: any;
    }>;
    env: Environment;
    actorType: string;
}
