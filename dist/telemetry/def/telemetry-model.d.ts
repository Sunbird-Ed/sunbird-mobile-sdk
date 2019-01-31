export declare class Actor {
    static readonly TYPE_SYSTEM: string;
    static readonly TYPE_USER: string;
    id: string;
    type: string;
}
export declare class Audit {
    env: string;
    props: Array<string>;
    currentState: string;
    prevState: string;
    actorType: string;
}
export declare class Context {
    channel: string;
    pdata: ProducerData;
    env: string;
    sid: string;
    did: string;
    cdata: Array<CorrelationData>;
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
export declare class End {
    env: string;
    type: string;
    mode: string;
    duration: number;
    pageId: string;
    objId: string;
    objType: string;
    objVer: string;
    rollup: Rollup;
    summaryList: Array<{
        [index: string]: any;
    }>;
    correlationData: Array<CorrelationData>;
}
export declare class Error {
    errorCode: string;
    errorType: string;
    stacktrace: string;
    pageId: string;
    env: string;
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
export declare class Impression {
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
}
export declare class Interact {
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
}
export declare class Interrupt {
    env: string;
    type: string;
    pageId: string;
}
export declare class Log {
    env: string;
    type: string;
    level: string;
    message: string;
    pageId: string;
    params: Array<{
        [index: string]: any;
    }>;
    actorType: string;
}
export declare class ProducerData {
    id: string;
    pid: string;
    ver: string;
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
export declare class Start {
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
}
export declare class TelemetryObject {
    id: string;
    type: string;
    version: string;
    rollup: Rollup;
}
export declare class ProcessedEventModel {
    msgId: string;
    data: string;
    numberOfEvents: number;
    priority: number;
}
