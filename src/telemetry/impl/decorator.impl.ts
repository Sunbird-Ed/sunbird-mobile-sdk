import { TelemetryDecorator } from "..";

export class TelemetryDecoratorImpl implements TelemetryDecorator {
    
    decorate(event: any): any {
        return event;
    }    
    
    prepare(event: any) {
        return {
            event: JSON.stringify(event),
            event_type: event["type"],
            timestamp: new Date().getTime(),
            priority: 1
        }
    }


}