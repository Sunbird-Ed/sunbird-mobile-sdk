import {Environment, InteractType, LogLevel, LogType, PageId, ShareItemType} from './telemetry-constants';
import {Actor, AuditState, CorrelationData, DeviceSpecification, Rollup, Visit} from './telemetry-model';

export interface TelemetryAuditRequest {
    env: string;
    actor: Actor;
    currentState: AuditState;
    updatedProperties?: string[];
    type?: string;
    objId?: string;
    objType?: string;
    objVer?: string;
    correlationData?: Array<CorrelationData>;
    rollUp?: Rollup;
}

export class TelemetryInteractRequest {
    type: InteractType;
    subType: string;
    id?: string;
    pageId?: string;
    pos?: Array<{ [index: string]: string }> = [];
    env: string;
    rollup?: Rollup;
    valueMap?: { [index: string]: any };
    correlationData?: Array<CorrelationData>;
    objId?: string;
    objType?: string;
    objVer?: string;
}

export class TelemetryErrorRequest {
    errorCode: string;
    errorType: string;
    stacktrace: string;
    pageId: string;
}

export class TelemetryInterruptRequest {
    type: string;
    pageId: string;
}

export class TelemetryImpressionRequest {
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

export class TelemetryStartRequest {
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

export class TelemetrySummaryRequest {
    type: string;
    starttime: number;
    endtime: number;
    timespent: number;
    pageviews: number;
    interactions: number;
    env: Environment;
    mode?: string;
    envsummary?: {
        env: string,
        timespent: number,
        visits: number
    }[];
    eventsummary?: {
        id: string,
        count: number
    } [];
    pagesummary?: {
        id: string,
        type: string,
        env: string,
        timespent: number,
        visits: number
    }[];
    extra?: {
        id: string,
        value: string
    }[];
    correlationData?: Array<CorrelationData>;
    objId?: string;
    objType?: string;
    objVer?: string;
    rollup?: Rollup;
}

export class TelemetryEndRequest {
    env: Environment;
    type?: string;
    mode?: string;
    duration?: number;
    pageId?: string;
    objId?: string;
    objType?: string;
    objVer?: string;
    rollup?: Rollup;
    summaryList?: Array<{ [index: string]: any }>;
    correlationData?: Array<CorrelationData>;
}

export class TelemetryFeedbackRequest {
    env: string;
    rating?: number;
    comments: string;
    objId: string;
    objType: string;
    objVer: string;
    commentid?: string;
    commenttxt?: string;
}


export class TelemetryLogRequest {
    type: LogType;
    level: LogLevel;
    message: string;
    pageId: string;
    params: Array<{ [index: string]: any }>;
    env: Environment;
    actorType: string;
}

export class TelemetryShareRequest {
    dir: string;
    type: string;
    items: Array<Item> = [];
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
    metadata?: { [index: string]: any };
}

export interface TelemetryImportRequest {
    sourceFilePath: string;
}

export interface TelemetrySyncRequest {
    ignoreSyncThreshold?: boolean;
    ignoreAutoSyncMode?: boolean;
}


