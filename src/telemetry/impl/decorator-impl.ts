import {Actor, Context, ProducerData, TelemetryDecorator, TelemetryEvents} from '..';
import {ApiConfig} from '../../api';
import {DeviceInfo} from '../../util/device/def/device-info';
import Telemetry = TelemetryEvents.Telemetry;

export class TelemetryDecoratorImpl implements TelemetryDecorator {

    constructor(private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo) {
    }

    decorate(event: Telemetry, uid: string, sid: string, gid?: string): any {
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
        if (!event.getActor()) {
            event.setActor(new Actor());
        }

        const actor: Actor = event.getActor();

        if (!actor.id) {
            actor.id = uid;
        }
    }

    patchContext(event: Telemetry, sid) {
        if (!event.getContext()) {
            event.setContext(new Context());
        }
        const context: Context = event.getContext();
        context.channel = this.apiConfig.api_authentication.channelId;
        this.patchPData(context);
        if (!context.env) {
            context.setEnv('app');
        }
        context.sid = sid;
        context.did = this.deviceInfo.getDeviceID();
    }

    patchPData(event: Context) {
        if (!event.pdata) {
            event.pdata = new ProducerData();
        }
        const pData: ProducerData = event.pdata;
        if (!pData.hasOwnProperty('id')) {
            pData.id = this.apiConfig.api_authentication.producerId;
        }

        const pid = pData.pid;
        pData.pid = pid ? this.apiConfig.api_authentication.producerUniqueId : 'geniesdk.android';

        if (pData.ver) {
            pData.ver = '';
        }
    }

    prepare(event: any) {
        return {
            event: JSON.stringify(event),
            event_type: event['type'],
            timestamp: new Date().getTime(),
            priority: 1
        };
    }
}
