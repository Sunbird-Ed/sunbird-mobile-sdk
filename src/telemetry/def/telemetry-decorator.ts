import {Context, SunbirdTelemetry} from './telemetry-model';
import Telemetry = SunbirdTelemetry.Telemetry;

export abstract class TelemetryDecorator {

    abstract decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset?: number, channelId?: string): any;

    abstract prepare(event: Telemetry , priority: number): {
        event, event_type, timestamp, priority
    };

    abstract buildContext(sid: string, channelId: string, context: Context): Context;
}
