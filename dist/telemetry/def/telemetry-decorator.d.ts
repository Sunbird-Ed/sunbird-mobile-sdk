import { Context, SunbirdTelemetry } from './telemetry-model';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare abstract class TelemetryDecorator {
    abstract decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset?: number, channelId?: string): any;
    abstract prepare(event: Telemetry, priority: number): {
        event: any;
        event_type: any;
        timestamp: any;
        priority: any;
    };
    abstract buildContext(sid: string, channelId: string, context: Context): Context;
}
