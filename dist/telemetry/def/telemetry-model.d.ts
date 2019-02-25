import { LogLevel, PageId } from './telemetry-constants';
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
    private env;
    private cdata;
    channel: string;
    pdata: ProducerData;
    sid: string;
    did: string;
    getEnvironment(): string;
    setEnvironment(value: string): void;
    setCdata(value: Array<CorrelationData>): void;
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
export declare class Feedback {
    env: string;
    rating: number;
    comments: string;
    id: string;
    version: string;
    type: string;
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
    l1: string;
    l2: string;
    l3: string;
    l4: string;
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
    getId(): string;
    getPid(): string;
    getVersion(): string;
    setId(value: string): void;
    setPid(value: string): void;
    setVersion(value: string): void;
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
export declare class Share {
    env: string;
    direction: string;
    dataType: string;
    items: Array<{
        [index: string]: any;
    }>;
}
export declare class TelemetryObject {
    private rollup?;
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
export declare namespace TelemetryEvents {
    abstract class Telemetry {
        private static readonly TELEMETRY_VERSION;
        /**
         * unique event ID.
         */
        private eid;
        /**
         * epoch timestamp of event capture in epoch format (time in milli-seconds. For ex: 1442816723).
         */
        private ets;
        /**
         * version of the event data structure, currently "3".
         */
        private ver;
        /**
         * Who did the event
         * Actor of the event
         */
        private actor;
        /**
         * Who did the event
         * Context in which the event has occured.
         */
        private context;
        /**
         * What is the target of the event
         * Object which is the subject of the event
         */
        private object;
        private edata;
        private tags;
        protected constructor(eid: string);
        getEid(): string;
        setActor(value: Actor): void;
        setContext(value: Context): void;
        setEdata(value: {}): void;
        setTags(value: string[]): void;
        setEnvironment(env: string): void;
        setCoRrelationdata(correlationData: CorrelationData[]): void;
        setObject(id: string, type: string, ver: string, rollup: Rollup): void;
        getActor(): Actor;
        getContext(): Context;
    }
    class End extends Telemetry {
        private static readonly EID;
        type: string;
        mode: string;
        duration: number;
        pageId: string;
        summaryList: Array<{
            [index: string]: any;
        }>;
        env: string;
        objId: string;
        objType: string;
        objVer: string;
        rollup: Rollup;
        correlationData: Array<CorrelationData>;
        constructor(type: string, mode: string, duration: number, pageid: PageId, summaryList: {}[]);
    }
    class Start extends Telemetry {
        private static readonly EID;
        env: string;
        type: string;
        deviceSpecification: DeviceSpecification;
        loc: string;
        mode: string;
        duration: number;
        pageId: string;
        objId: string;
        objType: string;
        objVer: string;
        rollup: Rollup;
        correlationData: Array<CorrelationData>;
        constructor(type: string, dSpec: DeviceSpecification, loc: string, mode: string, duration: number, pageId: PageId);
    }
    class Interact extends Telemetry {
        private static readonly EID;
        env: string;
        type: string;
        subType: string;
        id: string;
        pageId: string;
        pos: Array<{
            [index: string]: string;
        }>;
        values: Array<{
            [index: string]: any;
        }>;
        valueMap: {
            [index: string]: any;
        };
        correlationData: Array<CorrelationData>;
        objId: string;
        objType: string;
        objVer: string;
        rollup: Rollup;
        constructor(type: string, subtype: string, id: string, pageid: PageId, pos: {
            [key: string]: string;
        }[], values: {}[]);
    }
    class Impression extends Telemetry {
        private static readonly EID;
        type: string;
        pageId: string;
        subType: string;
        uri: string;
        objId: string;
        correlationData: Array<CorrelationData>;
        objType: string;
        objVer: string;
        rollup?: Rollup;
        env: string;
        constructor(type: string, subtype: string, pageid: PageId, uri: string, visits: Visit[]);
    }
    class Log extends Telemetry {
        private static readonly EID;
        env: string;
        type: string;
        level: LogLevel;
        message: string;
        pageId: string;
        params: Array<{
            [index: string]: any;
        }>;
        actorType: string;
        constructor(type: string, level: LogLevel, message: string, pageid: PageId, params: {}[]);
    }
    class Error extends Telemetry {
        private static readonly EID;
        errorCode: string;
        errorType: string;
        stacktrace: string;
        pageId: string;
        env: string;
        constructor(errorCode: string, errorType: string, stacktrace: string, pageid: PageId);
    }
}
