import dayjs from 'dayjs';
import {ProcessedEventModel} from '..';
import {UniqueId} from '../../db/util/unique-id';

export class EventProcessor {

    process(eventJsonArray: Array<any>) {
        const mesgId = UniqueId.generateUniqueId();
        const processedEventMap = {
            id: 'ekstep.telemetry',
            ver: '1.0',
            ts: this.formatCurrentDate(),
            params: this.getParams(mesgId),
            events: eventJsonArray
        };

        const model = new ProcessedEventModel();
        model.data = JSON.stringify(processedEventMap);
        model.msgId = mesgId;

    }

    private getParams(msgid: string) {
        return {
            did: (<any>window).device.uuid,
            msgid: msgid,
            key: '',
            requesterId: ''
        };
    }

    private formatCurrentDate() {
        return dayjs().format();
    }

}
