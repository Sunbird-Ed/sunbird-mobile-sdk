import {TelemetryEvents} from './telemetry-model';
import Telemetry = TelemetryEvents.Telemetry;

export abstract class TelemetryDecorator {

    abstract decorate(event: Telemetry, uid: string, sid: string, gid?: string): any;

    abstract prepare(event: any): {
        event, event_type, timestamp, priority
    };

}
