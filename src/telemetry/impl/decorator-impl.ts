import {TelemetryDecorator, TelemetryEvents} from '..';
import Telemetry = TelemetryEvents.Telemetry;

export class TelemetryDecoratorImpl implements TelemetryDecorator {

    decorate(event: Telemetry): any {
        return event;
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
