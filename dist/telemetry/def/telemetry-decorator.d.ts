import { ProfileSession } from '../../profile';
import { TelemetryEvents } from './telemetry-model';
import Telemetry = TelemetryEvents.Telemetry;
export declare abstract class TelemetryDecorator {
    abstract decorate(event: Telemetry, profileSession: ProfileSession, groupSession: ProfileSession): any;
    abstract prepare(event: any): {
        event: any;
        event_type: any;
        timestamp: any;
        priority: any;
    };
}
