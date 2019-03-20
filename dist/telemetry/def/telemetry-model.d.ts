import { LogLevel, ShareItemType } from './telemetry-constants';
export declare class Actor {
    static readonly TYPE_SYSTEM: string;
    static readonly TYPE_USER: string;
    id: string;
    type: string;
    constructor();
}
export declare class ReportSummary {
    uid: string;
    contentId: string;
    name: string;
    lastUsedTime: number;
    noOfQuestions: number;
    correctAnswers: number;
    totalTimespent: number;
    hierarchyData: string;
    totalMaxScore: number;
    totalScore: number;
}
export declare class Audit {
    env: string;
    props: Array<string>;
    currentState: string;
    prevState: string;
    actorType: string;
}
export declare class Context {
    env: string;
    cdata: Array<CorrelationData>;
    channel: string;
    pdata: ProducerData;
    sid: string;
    did: string;
}
export declare class DeviceSpecification {
    os: string;
    make: string;
    id: string;
    mem: number;
    idisk: number;
    edisk: number;
    scrn: number;
    camera: string;
    cpu: string;
    sims: number;
    cap: Array<string>;
}
export declare class Etags {
    app: Array<string>;
    partner: Array<string>;
    dims: Array<string>;
}
export declare class ExData {
    type: string;
    data: string;
}
export declare class GameData {
    id: string;
    ver: string;
}
export declare class CorrelationData {
    id: string;
    type: string;
}
export declare class Rollup {
    l1?: string;
    l2?: string;
    l3?: string;
    l4?: string;
}
export declare class Visit {
    objid: string;
    objtype: string;
    objver: string;
    section: string;
    index: number;
}
export declare class Interrupt {
    env: string;
    type: string;
    pageId: string;
}
export declare class ProducerData {
    id: string;
    pid: string;
    ver: string;
    ProducerData(): void;
}
export declare class Search {
    type: string;
    query: string;
    filters: {
        [index: string]: any;
    };
    sort: {
        [index: string]: any;
    };
    correlationid: string;
    size: number;
}
export declare class TelemetryObject {
    rollup?: Rollup;
    readonly id: string;
    readonly type: string;
    readonly version: string;
    constructor(id: string, type: string, version: string);
    setRollup(value: Rollup): void;
}
export declare class ProcessedEventModel {
    msgId: string;
    data: string;
    numberOfEvents: number;
    priority: number;
}
export declare namespace SunbirdTelemetry {
    abstract class Telemetry {
        private static readonly TELEMETRY_VERSION;
        eid: string;
        mid: string;
        ets: number;
        ver: string;
        actor: Actor;
        context: Context;
        object: TelemetryObject;
        edata: any;
        tags: string[];
        protected constructor(eid: string);
    }
    class End extends Telemetry {
        private static readonly EID;
        constructor(type: string | undefined, mode: string | undefined, duration: number | undefined, pageid: string | undefined, summaryList: {}[] | undefined, env: string, objId?: string, objType?: string, objVer?: string, rollup?: Rollup, correlationData?: Array<CorrelationData>);
    }
    class Start extends Telemetry {
        private static readonly EID;
        constructor(type: string | undefined, dSpec: DeviceSpecification | undefined, loc: string | undefined, mode: string | undefined, duration: number | undefined, pageId: string | undefined, env: string, objId?: string, objType?: string, objVer?: string, rollup?: Rollup, correlationData?: Array<CorrelationData>);
    }
    class Interact extends Telemetry {
        private static readonly EID;
        constructor(type: string | undefined, subtype: string | undefined, id: string | undefined, pageid: string | undefined, pos: {
            [key: string]: string;
        }[] | undefined, valuesMap: {
            [key: string]: any;
        } | undefined, env: string, objId?: string, objType?: string, objVer?: string, rollup?: Rollup, correlationData?: Array<CorrelationData>);
    }
    class Impression extends Telemetry {
        private static readonly EID;
        constructor(type: string | undefined, subtype: string | undefined, pageid: string | undefined, visits: Visit[] | undefined, env: string, objId?: string, objType?: string, objVer?: string, rollup?: Rollup, correlationData?: Array<CorrelationData>);
    }
    class Log extends Telemetry {
        private static readonly EID;
        constructor(type: string | undefined, level: LogLevel | undefined, message: string | undefined, pageid: string | undefined, params: {}[] | undefined, env: string, actorType: any);
    }
    class Error extends Telemetry {
        private static readonly EID;
        constructor(errorCode: string | undefined, errorType: string | undefined, stacktrace: string | undefined, pageid: string | undefined);
    }
    class Share extends Telemetry {
        private static readonly EID;
        constructor(dir: string | undefined, type: string | undefined, items: Array<{
            [index: string]: any;
        }> | undefined);
        addItem(type: ShareItemType, origin: string, identifier: string, pkgVersion: number, transferCount: number, size: string): void;
        capitalize(input: any): string;
    }
    class Feedback extends Telemetry {
        private static readonly EID;
        constructor(rating: number | undefined, comments: string | undefined, env: string, objId?: string, objType?: string, objVer?: string);
    }
}
