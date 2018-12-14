export abstract class TelemetryDecorator {

    abstract decorate(event: any): any;

    abstract prepare(event: any): {
        event, event_type, timestamp, priority
    };

}