import {Environment, InteractSubtype, InteractType, PageId} from './telemetry-constants';
import {CorrelationData, Rollup, TelemetryObject} from './telemetry-model';

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
    // TODO
    some_value: string;
}
