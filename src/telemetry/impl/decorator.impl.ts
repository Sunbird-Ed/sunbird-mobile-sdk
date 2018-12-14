import { TelemetryDecorator } from "../def/telemetry.decorator";
import { Injectable } from "@angular/core";

@Injectable()
export class SunbirdTelemetryDecorator implements TelemetryDecorator {
    
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