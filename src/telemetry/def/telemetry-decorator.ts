import {TelemetryEvents} from './telemetry-model';
import Telemetry = TelemetryEvents.Telemetry;

export abstract class TelemetryDecorator {

    abstract decorate(event: Telemetry, uid: string, sid: string, gid?: string): any;

    abstract prepare(event: Telemetry , priority: number): {
        event, event_type, timestamp, priority
    };

}
