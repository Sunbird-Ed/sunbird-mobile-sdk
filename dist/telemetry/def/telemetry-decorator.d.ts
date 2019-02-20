import { TelemetryEvents } from './telemetry-model';
import Telemetry = TelemetryEvents.Telemetry;
export declare abstract class TelemetryDecorator {
    abstract decorate(event: Telemetry, uid: string, sid: string, gid?: string): any;
    abstract prepare(event: any): {
        event: any;
        event_type: any;
        timestamp: any;
        priority: any;
    };
}
