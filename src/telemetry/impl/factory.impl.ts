import { TelemetryFactory } from "..";
import { Rollup, CorrelationData, Impression } from "..";
import { Injectable } from "@angular/core";

@Injectable()
export class SunbirdTelemetryFactory implements TelemetryFactory {

    constructor() {

    }


    createImpression(type: any, subtype: any, pageid: any, env: any,
        objectId?: string, objectType?: string, objectVersion?: string,
        rollup?: Rollup, corRelationList?: CorrelationData[]): Impression {

        let impression = new Impression();
        impression.type = type;
        impression.subType = subtype;
        impression.pageId = pageid;
        impression.env = env;
        impression.objId = objectId ? objectId : "";
        impression.objType = objectType ? objectType : "";
        impression.objVer = objectVersion ? objectVersion : "";

        if (rollup !== undefined) {
            impression.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            impression.correlationData = corRelationList;
        }

        return impression;
    }

}