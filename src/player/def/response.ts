import {Content} from '../../content';
import {Actor, CorrelationData, ProducerData} from '../../telemetry';

export interface PlayerInput {
    context?: Context;
    metaData?: Content;
    config?: PlayerConfig;
    appContext?: { [key: string]: any };
}

export interface Context {
    sid?: string;
    did?: string;
    actor?: Actor;
    channel?: string;
    pdata?: ProducerData;
    deeplinkBasePath?: string;
    cdata?: CorrelationData[];
}

export interface PlayerConfig {
    splash: {
        text: string,
        icon: string,
        bgImage: string,
        webLink: string
    };
    showEndPage: boolean;
    overlay: {
        enableUserSwitcher: boolean,
        showUser: boolean
    };
}
