import {Actor, Context, ProducerData, SunbirdTelemetry, TelemetryDecorator} from '..';
import {ApiConfig} from '../../api';
import {DeviceInfo} from '../../util/device/def/device-info';
import {AppInfo} from '../../util/app/def/app-info';
import Telemetry = SunbirdTelemetry.Telemetry;
import {UniqueId} from '../../db/util/unique-id';

export class TelemetryDecoratorImpl implements TelemetryDecorator {

    constructor(private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo,
                private appInfo: AppInfo) {
    }

    decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset: number = 0): any {
        event.ets += offset;
        if (!event.mid) {
            event.mid = UniqueId.generateUniqueId();
        }
        if (uid) {
            this.patchActor(event, uid);
        } else {
            this.patchActor(event, '');
        }

        this.patchContext(event, sid);
        // TODO Add tag patching logic
        return event;
    }

    patchActor(event: Telemetry, uid: string) {
        if (!event.actor) {
            event.actor = new Actor();
        }

        const actor: Actor = event.actor;

        if (!actor.id) {
            actor.id = uid;
        }
    }

    patchContext(event: Telemetry, sid) {
        if (!event.context) {
            event.context = new Context();
        }
        const context: Context = event.context;
        context.channel = this.apiConfig.api_authentication.channelId;
        this.patchPData(context);
        if (!context.env) {
            context.env = 'app';
        }
        context.sid = sid;
        context.did = this.deviceInfo.getDeviceID();
    }

    patchPData(event: Context) {
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
            pData.pid = 'geniesdk.android';
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
