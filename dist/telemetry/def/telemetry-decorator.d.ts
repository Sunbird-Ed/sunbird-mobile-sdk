export declare abstract class TelemetryDecorator {
    abstract decorate(event: any): any;
    abstract prepare(event: any): {
        event: any;
        event_type: any;
        timestamp: any;
        priority: any;
    };
}
