import {Actor, Context, CorrelationData, ProducerData, SunbirdTelemetry, TelemetryDecorator} from '..';
import {ApiConfig} from '../../api';
import {DeviceInfo} from '../../util/device';
import {AppInfo} from '../../util/app';
import {UniqueId} from '../../db/util/unique-id';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {CodePushExperimentService} from '../../codepush-experiment';
import {ProfileSession} from '../../profile';
import Telemetry = SunbirdTelemetry.Telemetry;

@injectable()
export class TelemetryDecoratorImpl implements TelemetryDecorator {
    private apiConfig: ApiConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo,
        @inject(InjectionTokens.CODEPUSH_EXPERIMENT_SERVICE) private codePushExperimentService: CodePushExperimentService) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    decorate(
        event: Telemetry,
        profileSession: ProfileSession,
        gid?: string,
        offset: number = 0,
        channelId?: string,
        campaignParameters?: CorrelationData[],
        globalCData?: CorrelationData[]
    ): any {
        const {uid, sid} = profileSession;
        event.ets += offset;
        if (!event.mid) {
            event.mid = UniqueId.generateUniqueId();
        }
        if (uid) {
            this.patchActor(event, uid);
        } else {
            this.patchActor(event, '');
        }
        this.patchContext(event, sid, channelId, campaignParameters, globalCData);
        // TODO Add tag patching logic
        event.context.cdata = [
            ...event.context.cdata, {
                id: profileSession.managedSession ? profileSession.managedSession.sid : profileSession.sid,
                type: 'UserSession'
            }
        ];
        return event;
    }

    private patchActor(event: Telemetry, uid: string) {
        if (!event.actor) {
            event.actor = new Actor();
        }
        const actor: Actor = event.actor;
        if (!actor.id) {
            actor.id = uid;
        }
        if (!actor.type) {
            actor.type = Actor.TYPE_USER;
        }
    }

    private patchContext(event: Telemetry, sid, channelId, campaignParameters?: CorrelationData[], globalCdata?: CorrelationData[]) {
        if (!event.context) {
            event.context = new Context();
        }
        event.context = this.buildContext(sid, channelId, event.context, campaignParameters, globalCdata);
    }

    private patchPData(event: Context) {
        if (!event.pdata) {
            event.pdata = new ProducerData();
        }
        const pData: ProducerData = event.pdata;
        if (!pData.id) {
            pData.id = this.apiConfig.api_authentication.producerId;
        }
        const pid = pData.pid;
        if (pid) {
            pData.pid = pid;
        } else if (this.apiConfig.api_authentication.producerUniqueId) {
            pData.pid = this.apiConfig.api_authentication.producerUniqueId;
        } else {
            pData.pid = 'sunbird.android';
        }
        if (!pData.ver) {
            pData.ver = this.appInfo.getVersionName();
        }
    }

    prepare(event: Telemetry, priority) {
        return {
            event: JSON.stringify(event),
            event_type: event.eid,
            timestamp: Date.now(),
            priority: 1
        };
    }

    buildContext(sid: string, channelId: string, context: Context, campaignParameters?: CorrelationData[], globalCData?: CorrelationData[]): Context {
        context.channel = channelId;
        this.patchPData(context);
        if (!context.env) {
            context.env = 'app';
        }
        const expKey = this.codePushExperimentService.getExperimentKey();
        if (typeof (expKey) === 'string') {
            context.pdata.pid = context.pdata.pid + '-' + expKey;
        }
        context.sid = sid;
        context.did = this.deviceInfo.getDeviceID();
        if (channelId !== this.apiConfig.api_authentication.channelId) {
            context.rollup = {l1: channelId};
        }
        // patching cData
        context.cdata = context.cdata ? context.cdata.concat(campaignParameters || []) : (campaignParameters || []);
        context.cdata = context.cdata ? context.cdata.concat(globalCData || []) : (globalCData || []);
        return context;
    }
}
