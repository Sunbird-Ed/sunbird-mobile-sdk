import {Context, CorrelationData, SunbirdTelemetry} from './telemetry-model';
import {ProfileSession} from '../../profile';
import Telemetry = SunbirdTelemetry.Telemetry;

export abstract class TelemetryDecorator {

    abstract decorate(event: Telemetry, profileSession: ProfileSession, gid?: string, offset?: number, channelId?: string,
                      campaignParameters?: CorrelationData[], globalCData?: CorrelationData[]): any;

    abstract prepare(event: Telemetry, priority: number): {
        event, event_type, timestamp, priority
    };

    abstract buildContext(sid: string, channelId: string, context: Context): Context;
}
