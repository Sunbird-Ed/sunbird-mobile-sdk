import {LogLevel, PageId} from './telemetry-constants';

export class Actor {
    static readonly TYPE_SYSTEM = 'System';
    static readonly TYPE_USER = 'User';
    id: string;
    type: string;

    Actor() {
        this.type = Actor.TYPE_USER;
    }
}

export class Audit {
    env: string;
    props: Array<string>;
    currentState: string;
    prevState: string;
    actorType: string;
}

export class Context {
    private _env: string;
    private cdata: Array<CorrelationData>;

    channel: string;
    pdata: ProducerData;
    sid: string;
    did: string;


    get env(): string {
        return this._env;
    }

    public setEnv(value: string) {
        this._env = value;
    }

    public setCdata(value: Array<CorrelationData>) {
        this.cdata = value;
    }
}

export class DeviceSpecification {
    os = '';
    make = '';
    id = '';
    mem = -1.0;
    idisk = -1.0;
    edisk = -1.0;
    scrn = -1.0;
    camera: string;
    cpu = '';
    sims = -1;
    cap: Array<string> = [];
}

export class Etags {
    app: Array<string>;
    partner: Array<string>;
    dims: Array<string>;
}

export class ExData {
    type: string;
    data: string;

}

export class Feedback {
    env: string;
    rating: number;
    comments: string;
    id: string;
    version: string;
    type: string;
}

export class GameData {
    id: string;
    ver: string;
}

export class CorrelationData {
    id: string;
    type: string;
}

export class Rollup {
    l1: string;
    l2: string;
    l3: string;
    l4: string;
}

export class Visit {
    objid: string;
    objtype: string;
    objver: string;
    section: string;
    index: number;
}

export class Interrupt {
    env: string;
    type: string;
    pageId: string;
}

export class ProducerData {
    id: string;
    pid: string;
    ver: string;

    ProducerData() {
        this.id = '';
        this.pid = '';
        this.ver = '';
    }
}

export class Search {
    type: string;
    query: string;
    filters: { [index: string]: any };
    sort: { [index: string]: any };
    correlationid: string;
    size: number;
}

export class Share {
    env: string;
    direction: string;
    dataType: string;
    items: Array<{ [index: string]: any }>;
}

export class TelemetryObject {
    private rollup?: Rollup;
    private id: string;
    private type: string;
    private version: string;

    constructor(id: string, type: string, version: string) {
        this.id = id;
        this.type = type;
        this.version = version;
    }

    public setRollup(value: Rollup) {
        this.rollup = value;
    }
}

export class ProcessedEventModel {
    msgId: string;
    data: string;
    numberOfEvents: number;
    priority: number;
}

export namespace TelemetryEvents {
    export abstract class Telemetry {
        private static readonly TELEMETRY_VERSION: string = '3.0';

        /**
         * unique event ID.
         */
        private eid: string;

        /**
         * epoch timestamp of event capture in epoch format (time in milli-seconds. For ex: 1442816723).
         */
        private ets: number;

        /**
         * version of the event data structure, currently "3".
         */
        private ver: string = Telemetry.TELEMETRY_VERSION;

        /**
         * Who did the event
         * Actor of the event
         */
        private _actor: Actor;

        /**
         * Who did the event
         * Context in which the event has occured.
         */
        private _context: Context;

        /**
         * What is the target of the event
         * Object which is the subject of the event
         */
        private object: TelemetryObject;

        private edata: {};

        private tags: string[];

        protected constructor(eid: string) {
            this.eid = eid;
            this.ets = Date.now();
            this._actor = new Actor();
            this._context = new Context();
            this.edata = {};
        }

        public setActor(value: Actor) {
            this._actor = value;
        }

        public setContext(value: Context) {
            this._context = value;
        }

        public setEdata(value: {}) {
            this.edata = value;
        }

        public setTags(value: string[]) {
            this.tags = value;
        }

        public setEnvironment(env: string) {
            this._context.setEnv(env);
        }

        public setCoRrelationdata(correlationData: CorrelationData[]) {
            this._context.setCdata(correlationData);
        }

        public setObject(id: string, type: string, ver: string, rollup: Rollup) {
            this.object = new TelemetryObject(id, type, ver);
            this.object.setRollup(rollup);
        }


        get actor(): Actor {
            return this._actor;
        }

        get context(): Context {
            return this._context;
        }
    }

    export class End extends Telemetry {
        private static readonly EID = 'END';

        type: string;
        mode: string;
        duration: number;
        pageId: string;
        summaryList: Array<{ [index: string]: any }>;
        env: string;
        objId: string;
        objType: string;
        objVer: string;
        rollup: Rollup;
        correlationData: Array<CorrelationData>;

        public constructor(type: string, mode: string, duration: number, pageid: PageId, summaryList: {}[]) {
            super(End.EID);
            this.setEdata({
                ...(type ? {type} : {}),
                ...(duration ? {duration} : {}),
                ...(pageid ? {pageid} : {}),
                ...(mode ? {mode} : {}),
                ...(summaryList ? {summaryList} : {})
            });
        }
    }

    export class Start extends Telemetry {
        private static readonly EID = 'START';

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


        constructor(type: string, dSpec: DeviceSpecification, loc: string, mode: string, duration: number, pageId: PageId) {
            super(Start.EID);
            this.setEdata({
                ...(type ? {type} : {type: ''}),
                ...(dSpec ? {dSpec} : {}),
                ...(loc ? {loc} : {}),
                ...(mode ? {mode} : {}),
                ...(duration ? {mode} : {}),
                ...(pageId ? {pageId} : {})
            });
        }
    }

    export class Interact extends Telemetry {
        private static readonly EID = 'INTERACT';

        env: string;
        type: string;
        subType: string;
        id: string;
        pageId: string;
        pos: Array<{ [index: string]: string }> = [];
        values: Array<{ [index: string]: any }> = [];
        valueMap: { [index: string]: any };
        correlationData: Array<CorrelationData>;
        objId: string;
        objType: string;
        objVer: string;
        rollup: Rollup;

        constructor(type: string, subtype: string, id: string, pageid: PageId, pos: { [key: string]: string }[], values: {}[]) {
            super(Interact.EID);
            this.setEdata({
                ...(type ? {type} : {type: ''}),
                ...(subtype ? {subtype} : {}),
                ...(id ? {id} : {}),
                ...(pageid ? {pageid} : {}),
                extra: {
                    ...(pos ? {pos} : {}),
                    ...(values ? {values} : {}),
                }
            });
        }
    }

    export class Impression extends Telemetry {
        private static readonly EID = 'IMPRESSION';

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

        public constructor(type: string, subtype: string, pageid: PageId, uri: string, visits: Visit[]) {
            super(Impression.EID);
            this.setEdata({
                ...(type ? {type} : {type: ''}),
                ...(subtype ? {subtype} : {}),
                ...(pageid ? {pageid} : {}),
                ...(uri ? {uri: pageid} : {}),
                ...(visits ? {visits} : {}),
            });
        }
    }

    export class Log extends Telemetry {
        private static readonly EID = 'LOG';

        env: string;
        type: string;
        level: LogLevel;
        message: string;
        pageId: string;
        params: Array<{ [index: string]: any }>;
        actorType: string;

        constructor(type: string, level: LogLevel, message: string, pageid: PageId, params: {}[]) {
            super(Log.EID);
            this.setEdata({
                ...(type ? {type} : {type: ''}),
                ...(level ? {level} : {}),
                ...(message ? {message} : {}),
                ...(pageid ? {pageid} : {}),
                ...(params ? {params} : {}),
            });
        }
    }

    export class Error extends Telemetry {
        private static readonly EID = 'ERROR';

        errorCode: string;
        errorType: string;
        stacktrace: string;
        pageId: string;
        env: string;

        constructor(errorCode: string, errorType: string, stacktrace: string, pageid: PageId) {
            super(Error.EID);

            this.setEdata({
                ...(errorCode ? {err: errorCode} : {}),
                ...(errorType ? {errtype: errorType} : {}),
                ...(stacktrace ? {stacktrace} : {}),
                ...(pageid ? {pageid} : {}),
            });
        }
    }
}
