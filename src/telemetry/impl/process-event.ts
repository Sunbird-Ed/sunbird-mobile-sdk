import * as moment from 'moment';
import {ProcessedEventModel} from '..';

export class EventProcessor {

    process(eventJsonArray: Array<any>) {
        const mesgId = this.uuid();
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
        const time = new Date();
        const format = `yyyy-MM-dd'T'HH:mm:ssZZ`;
        return moment(time).format(format);
    }

    private uuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}
