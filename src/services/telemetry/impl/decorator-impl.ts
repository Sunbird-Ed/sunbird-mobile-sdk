import {Actor, Context, ProducerData, SunbirdTelemetry, TelemetryDecorator} from '../index';
import {HttpConfig} from '../../../native/http';
import {DeviceInfo} from '../../../native/device/def/device-info';
import {AppInfo} from '../../../native/app/def/app-info';
import {UniqueId} from '../../../native/db/util/unique-id';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../../bootstrap/sdk-config';
import Telemetry = SunbirdTelemetry.Telemetry;

@injectable()
export class TelemetryDecoratorImpl implements TelemetryDecorator {

    private apiConfig: HttpConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo) {
        this.apiConfig = this.sdkConfig.httpConfig;
    }

    decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset: number = 0, channelId?: string): any {
        event.ets += offset;
        if (!event.mid) {
            event.mid = UniqueId.generateUniqueId();
        }
        if (uid) {
            this.patchActor(event, uid);
        } else {
            this.patchActor(event, '');
        }

        this.patchContext(event, sid, channelId);
        // TODO Add tag patching logic
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

    private patchContext(event: Telemetry, sid, channelId) {
        if (!event.context) {
            event.context = new Context();
        }
        const context: Context = event.context;
        context.channel = channelId;
        this.patchPData(context);
        if (!context.env) {
            context.env = 'app';
        }
        context.sid = sid;
        context.did = this.deviceInfo.getDeviceID();
        if (channelId !== this.apiConfig.api_authentication.channelId) {
            context.rollup = {l1: channelId};
        }
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
}
