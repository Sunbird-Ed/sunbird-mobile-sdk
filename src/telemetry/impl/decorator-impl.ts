import {TelemetryDecorator, TelemetryEvents} from '..';
import {AppConfig} from '../../api/config/app-config';
import {ApiAuthenticator} from '../../api/impl/api-authenticator';
import {ApiConfig} from '../../api';
import {DeviceInfo} from '../../util/device/def/device-info';
import {GroupService} from '../../group';
import {ProfileService, ProfileSession} from '../../profile';
import Telemetry = TelemetryEvents.Telemetry;

export class TelemetryDecoratorImpl implements TelemetryDecorator {

    constructor(private apiConfig: ApiConfig,
                private deviceInfo: DeviceInfo) {
    }

    decorate(event: Telemetry, profileSession: ProfileSession, groupSession: ProfileSession): any {
        if (profileSession && profileSession.uid) {
            this.patchActor(event, profileSession.uid);
        } else {
            this.patchActor(event, '');
        }

        this.patchContext(event, profileSession.sid);
        // TODO Add tag patching logic
        return event;
    }

    patchActor(event: any, uid: string) {
        if (!event.hasOwnProperty('actor')) {
            event.put('actor', {});
        }

        const actor: any = event['actor'];

        if (!actor.hasOwnProperty('id')) {
            actor.id = uid;
        }
    }

    patchContext(event: any, sid) {
        if (!event.hasOwnProperty('context')) {
            event.put('context', {});
        }
        const context: any = event['context'];
        context['channel'] = this.apiConfig.api_authentication.channelId;
        this.patchPData(event);
        if (!context.hasOwnProperty('env') || !context['env']) {
            context['env'] = 'app';
        }
        context['sid'] = sid;
        context['did'] = this.deviceInfo.getDeviceID();
    }

    patchPData(event: any) {
        if (!event.hasOwnProperty('pdata')) {
            event.put('pdata', {});
        }
        const pData: any = event['pdata'];
        if (!pData.hasOwnProperty('id')) {
            pData['id'] = this.apiConfig.api_authentication.producerId;
        }

        const pid = pData['pid'];
        pData['pid'] = pid ? this.apiConfig.api_authentication.producerUniqueId : 'geniesdk.android';

        if (pData.hasOwnProperty('ver')) {
            pData['ver'] = '';
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
