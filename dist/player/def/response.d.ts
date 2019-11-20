import { Content } from '../../content';
import { Actor, CorrelationData, ProducerData, Rollup } from '../../telemetry';
export interface PlayerInput {
    context?: Context;
    metadata?: Content;
    config?: PlayerConfig;
    appContext?: {
        [key: string]: any;
    };
}
export interface Context {
    sid?: string;
    did?: string;
    actor?: Actor;
    channel?: string;
    pdata?: ProducerData;
    deeplinkBasePath?: string;
    cdata?: CorrelationData[];
    contextRollup?: Rollup;
    objectRollup?: Rollup;
    origin?: string;
}
export interface PlayerConfig {
    splash: {
        text: string;
        icon: string;
        bgImage: string;
        webLink: string;
    };
    showEndPage: boolean;
    endPage: Array<any>;
    overlay: {
        enableUserSwitcher: boolean;
        showUser: boolean;
    };
    plugins?: Plugin[];
}
export interface Plugin {
    id: string;
    ver: string;
    type: string;
}
