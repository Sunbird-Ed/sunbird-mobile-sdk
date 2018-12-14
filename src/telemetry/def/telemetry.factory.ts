import { Rollup, CorrelationData, Impression } from "./telemetry.model";

export abstract class TelemetryFactory {

    abstract createImpression(type, subtype, pageid, env, objectId?: string,
        objectType?: string, objectVersion?: string, rollup?: Rollup,
        corRelationList?: Array<CorrelationData>): Impression;

}