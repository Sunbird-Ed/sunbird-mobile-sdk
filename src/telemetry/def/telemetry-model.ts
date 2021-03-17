import {LogLevel, ShareItemType} from './telemetry-constants';
import {NumberUtil} from '../../util/number-util';

export class Actor {
    static readonly TYPE_SYSTEM = 'System';
    static readonly TYPE_USER = 'User';
    id: string;
    type: string;

    constructor() {
        this.type = Actor.TYPE_USER;
    }
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
    totalQuestionsScore: number;
}

export class Context {
    env: string;
    cdata: Array<CorrelationData>;
    channel: string;
    pdata: ProducerData;
    sid: string;
    did: string;
    rollup: Rollup;
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

// export class Feedback {
//     env: string;
//     rating: number;
//     comments: string;
//     id: string;
//     version: string;
//     type: string;
// }

export class GameData {
    id: string;
    ver: string;
}

export class CorrelationData {
    id: string;
    type: string;
}

export class Rollup {
    l1?: string;
    l2?: string;
    l3?: string;
    l4?: string;
}

export class Visit {
    objid: string;
    objtype: string;
    objver: string;
    section: string;
    index: number;
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

// export class Share {
//     env: string;
//     direction: string;
//     dataType: string;
//     items: Array<{ [index: string]: any }>;
// }

export class TelemetryObject {
    public rollup?: Rollup;
    public readonly id: string;
    public readonly type: string;
    public readonly version: string;

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

export enum AuditState {
    AUDIT_CREATED = 'Created',
    AUDIT_UPDATED = 'Updated',
    AUDIT_DELETED = 'Deleted'
}

export namespace SunbirdTelemetry {
    export abstract class Telemetry {
        private static readonly TELEMETRY_VERSION: string = '3.0';

        public eid: string;
        public mid: string;
        public ets: number;
        public ver: string = Telemetry.TELEMETRY_VERSION;
        public actor: Actor;
        public context: Context;
        public object: TelemetryObject;
        public edata: any;
        public tags: string[];

        protected constructor(eid: string) {
            this.eid = eid;
            this.ets = Date.now();
            this.actor = new Actor();
            this.context = new Context();
            this.edata = {};
        }
    }

    export class End extends Telemetry {
        private static readonly EID = 'END';

        public constructor(type: string | undefined,
                           mode: string | undefined,
                           duration: number | undefined,
                           pageid: string | undefined,
                           summaryList: {}[] | undefined,
                           env: string,
                           objId: string = '',
                           objType: string = '',
                           objVer: string = '',
                           rollup: Rollup = {},
                           correlationData: Array<CorrelationData> = []) {
            super(End.EID);
            this.edata = {
                ...(type ? {type} : {}),
                ...(duration ? {duration} : {}),
                ...(pageid ? {pageid} : {}),
                ...(mode ? {mode} : {}),
                ...(summaryList ? {summaryList} : {})
            };
            this.context.cdata = correlationData;
            this.context.env = env;

            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = rollup;
        }
    }

    export class Start extends Telemetry {
        private static readonly EID = 'START';

        constructor(type: string = '',
                    dspec: DeviceSpecification | undefined,
                    loc: string | undefined,
                    mode: string | undefined,
                    duration: number | undefined,
                    pageid: string | undefined,
                    env: string,
                    objId: string = '',
                    objType: string = '',
                    objVer: string = '',
                    rollup: Rollup = {},
                    correlationData: Array<CorrelationData> = []) {
            super(Start.EID);
            this.edata = {
                ...(type ? {type} : {type: ''}),
                ...(dspec ? {dspec} : {}),
                ...(loc ? {loc} : {}),
                ...(mode ? {mode} : {}),
                ...(duration ? {mode} : {}),
                ...(pageid ? {pageid} : {})
            };
            this.context.cdata = correlationData;
            this.context.env = env;
            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = rollup ? rollup : {};
        }
    }

    export class Summary extends Telemetry {
        private static readonly EID = 'SUMMARY';

        constructor(
            type: string,
            starttime: number,
            endtime: number,
            timespent: number,
            pageviews: number,
            interactions: number,
            env: string,
            mode?: string,
            envsummary?: {
                env: string,
                timespent: number,
                visits: number
            }[],
            eventsummary?: {
                id: string,
                count: number
            } [],
            pagesummary?: {
                id: string,
                type: string,
                env: string,
                timespent: number,
                visits: number
            }[],
            extra?: {
                id: string,
                value: string
            }[],
            correlationData: Array<CorrelationData> = [],
            objId: string = '',
            objType: string = '',
            objVer: string = '',
            rollup: Rollup = {},
        ) {
            super(Summary.EID);
            this.edata = {
                type, starttime, endtime, timespent, pageviews, interactions,
                ...(mode ? {mode} : {}),
                ...(envsummary ? {envsummary} : {}),
                ...(eventsummary ? {eventsummary} : {}),
                ...(pagesummary ? {pagesummary} : {}),
                ...(extra ? {extra} : {})
            };
            // TODO need to check
            this.context.cdata = correlationData;
            this.context.env = env;
            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = rollup ? rollup : {};
        }
    }

    export class Interact extends Telemetry {
        private static readonly EID = 'INTERACT';

        constructor(type: string,
                    subtype: string,
                    id: string | undefined,
                    pageid: string | undefined,
                    pos: { [key: string]: string }[] | undefined,
                    valuesMap: { [key: string]: any } | undefined,
                    env: string,
                    objId: string = '',
                    objType: string = '',
                    objVer: string = '',
                    rollup: Rollup = {},
                    correlationData: Array<CorrelationData> = []) {
            super(Interact.EID);
            this.edata = {
                ...{type},
                ...{subtype},
                ...(id ? {id} : {}),
                ...(pageid ? {pageid} : {}),
                extra: {
                    ...(pos ? {pos} : {}),
                    ...(valuesMap ? {values: [valuesMap]} : {}),
                }
            };
            this.context.cdata = correlationData;
            this.context.env = env;
            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = rollup ? rollup : {};
        }
    }

    export class Impression extends Telemetry {
        private static readonly EID = 'IMPRESSION';

        public constructor(type: string | undefined,
                           subtype: string | undefined,
                           pageid: string | undefined,
                           visits: Visit[] | undefined,
                           env: string,
                           objId: string = '',
                           objType: string = '',
                           objVer: string = '',
                           rollup: Rollup = {},
                           correlationData: Array<CorrelationData> = []) {
            super(Impression.EID);
            this.edata = {
                ...(type ? {type} : {type: ''}),
                ...(subtype ? {subtype} : {}),
                ...(pageid ? {pageid} : {}),
                ...(pageid ? {uri: pageid} : {}),
                ...(visits ? {visits} : {}),
            };
            this.context.cdata = correlationData;
            this.context.env = env;
            this.object = new TelemetryObject(objId ? objId : '', objType ? objType : '', objVer ? objVer : '');
            this.object.rollup = rollup ? rollup : {};
        }
    }

    export class Log extends Telemetry {
        private static readonly EID = 'LOG';

        constructor(type: string | undefined,
                    level: LogLevel | undefined,
                    message: string | undefined,
                    pageid: string | undefined,
                    params: {}[] | undefined,
                    env: string,
                    actorType) {
            super(Log.EID);
            this.edata = {
                ...(type ? {type} : {type: ''}),
                ...(level ? {level} : {}),
                ...(message ? {message} : {}),
                ...(pageid ? {pageid} : {}),
                ...(params ? {params} : {}),
            };
            this.context.env = env;
            const actor: Actor = new Actor();
            actor.type = actorType;
            this.actor = actor;
        }
    }

    export class Error extends Telemetry {
        private static readonly EID = 'ERROR';

        constructor(errorCode: string | undefined,
                    errorType: string | undefined,
                    stacktrace: string | undefined,
                    pageid: string | undefined) {
            super(Error.EID);

            this.edata = {
                ...(errorCode ? {err: errorCode} : {}),
                ...(errorType ? {errtype: errorType} : {}),
                ...(stacktrace ? {stacktrace} : {}),
                ...(pageid ? {pageid} : {}),
            };
        }
    }

    export class Interrupt extends Telemetry {
        private static readonly EID = 'INTERRUPT';

        constructor(type: string,
                    pageid: string | undefined) {
            super(Interrupt.EID);

            this.edata = {
                ...{type},
                ...(pageid ? {pageid} : {})
            };
        }
    }

    export class Share extends Telemetry {
        private static readonly EID = 'SHARE';

        constructor(dir: string | undefined,
                    type: string | undefined,
                    items: Array<{ [index: string]: any }> | undefined,
                    correlationData: Array<CorrelationData> = [],
                    objId: string = '',
                    objType: string = '',
                    objVer: string = '',
                    rollUp: Rollup = new Rollup()) {
            super(Share.EID);

            this.edata = {
                ...(dir ? {dir: dir} : {}),
                ...(type ? {type: type} : {}),
                ...(items ? {items: items} : {})
            };
            this.context.cdata = correlationData;
            this.object = new TelemetryObject(objId ? objId : '', objType ? objType : '', objVer ? objVer : '');
            this.object.rollup = rollUp;
        }

        addItem(type: ShareItemType | string, origin: string, identifier: string, pkgVersion: number,
                transferCount: number, size: string) {
            const item: { [index: string]: any } = {};
            item['origin'] = origin;
            item['id'] = identifier;
            item['type'] = this.capitalize(type.valueOf());
            if (type.valueOf() === ShareItemType.CONTENT.valueOf()
                || type.valueOf() === ShareItemType.EXPLODEDCONTENT.valueOf()) {
                item['ver'] = pkgVersion.toString();
                const paramsList: Array<{ [index: string]: any }> = [];
                const param: { [index: string]: any } = {};
                param['transfers'] = NumberUtil.parseInt(transferCount);
                param['size'] = size;
                paramsList.push(param);
                item['params'] = paramsList;
            }
            const originMap: { [index: string]: any } = {};
            originMap['id'] = origin;
            originMap['type'] = 'Device';
            item['origin'] = originMap;

            this.edata.items.push(item);
        }

        capitalize(input): string {
            return input.charAt(0).toUpperCase() + input.slice(1);
        }
    }

    export class Feedback extends Telemetry {
        private static readonly EID = 'FEEDBACK';

        constructor(rating: number | undefined,
                    comments: string | undefined,
                    env: string,
                    objId: string = '',
                    objType: string = '',
                    objVer: string = '',
                    commentid: string | undefined,
                    commenttxt: string | undefined) {
            super(Feedback.EID);

            this.edata = {
                ...(rating ? {rating: rating} : {}),
                ...(commentid ? {commentid: commentid} : {}),
                ...(commenttxt ? {commenttxt: commenttxt} : {}),
                ...(comments ? {comments: comments} : {}),
            };
            this.context.env = env;
            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = {};
        }
    }

    export class Audit extends Telemetry {
        private static readonly EID = 'AUDIT';

        constructor(env: string,
                    actor: Actor,
                    currentState: AuditState,
                    updatedProperties: string[] | undefined,
                    type: string | undefined,
                    objId: string = '',
                    objType: string = '',
                    objVer: string = '',
                    correlationData: Array<CorrelationData> = [],
                    rollup: Rollup = {}) {
            super(Audit.EID);

            this.edata = {
                ...{state: currentState},
                ...(updatedProperties ? {props: updatedProperties} : {}),
                ...{type}
            };
            this.context.cdata = correlationData;
            this.context.env = env;
            this.object = new TelemetryObject(objId, objType, objVer);
            this.object.rollup = rollup || {};
            this.actor = actor;
        }
    }
}
