import { Environment, InteractType, LogLevel, LogType, PageId, ShareItemType } from './telemetry-constants';
import { Actor, AuditState, CorrelationData, DeviceSpecification, Rollup, Visit } from './telemetry-model';
export interface TelemetryAuditRequest {
    env: string;
    actor: Actor;
    currentState: AuditState;
    updatedProperties?: string[];
    objId?: string;
    objType?: string;
    objVer?: string;
    correlationData?: Array<CorrelationData>;
}
export declare class TelemetryInteractRequest {
    type: InteractType;
    subType: string;
    id?: string;
    pageId?: string;
    pos?: Array<{
        [index: string]: string;
    }>;
    env: string;
    rollup?: Rollup;
    valueMap?: {
        [index: string]: any;
    };
    correlationData?: Array<CorrelationData>;
    objId?: string;
    objType?: string;
    objVer?: string;
}
export declare class TelemetryErrorRequest {
    errorCode: string;
    errorType: string;
    stacktrace: string;
    pageId: string;
}
export declare class TelemetryInterruptRequest {
    type: string;
    pageId: string;
}
export declare class TelemetryImpressionRequest {
    type?: string;
    subType?: string;
    pageId?: PageId;
    visits?: Visit[];
    env: string;
    objId?: string;
    objType?: string;
    objVer?: string;
    correlationData?: Array<CorrelationData>;
    rollup?: Rollup;
}
export declare class TelemetryStartRequest {
    type?: string;
    deviceSpecification?: DeviceSpecification;
    loc?: string;
    mode?: string;
    duration?: number;
    pageId?: string;
    env: Environment;
    objId?: string;
    objType?: string;
    objVer?: string;
    rollup?: Rollup;
    correlationData?: Array<CorrelationData>;
}
export declare class TelemetryEndRequest {
    env: Environment;
    type?: string;
    mode?: string;
    duration?: number;
    pageId?: string;
    objId?: string;
    objType?: string;
    objVer?: string;
    rollup?: Rollup;
    summaryList?: Array<{
        [index: string]: any;
    }>;
    correlationData?: Array<CorrelationData>;
}
export declare class TelemetryFeedbackRequest {
    env: string;
    rating?: number;
    comments: string;
    objId: string;
    objType: string;
    objVer: string;
    commentid?: string;
    commenttxt?: string;
}
export declare class TelemetryLogRequest {
    type: LogType;
    level: LogLevel;
    message: string;
    pageId: string;
    params: Array<{
        [index: string]: any;
    }>;
    env: Environment;
    actorType: string;
}
export declare class TelemetryShareRequest {
    dir: string;
    type: string;
    items: Array<Item>;
    env: string;
    correlationData?: Array<CorrelationData>;
    objId?: string;
    objType?: string;
    objVer?: string;
    rollUp?: Rollup;
}
export interface Item {
    type: ShareItemType | string;
    origin: string;
    identifier: string;
    pkgVersion: number;
    transferCount: number;
    size: string;
}
export interface ImportTelemetryContext {
    sourceDBFilePath: string;
    metadata?: {
        [index: string]: any;
    };
}
export interface TelemetryImportRequest {
    sourceFilePath: string;
}
export interface TelemetrySyncRequest {
    ignoreSyncThreshold?: boolean;
    ignoreAutoSyncMode?: boolean;
}
