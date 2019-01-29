import { TelemetryDecorator } from '..';
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    decorate(event: any): any;
    prepare(event: any): {
        event: string;
        event_type: any;
        timestamp: number;
        priority: number;
    };
}
