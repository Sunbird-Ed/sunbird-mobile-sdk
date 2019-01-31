import { TelemetryEndRequest } from '../def/requests';
export declare const GenerateEndTelemetryAfterMethod: (telemetryEndRequest: TelemetryEndRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateEndTelemetryBeforeMethod: (telemetryEndRequest: TelemetryEndRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateEndTelemetryAfterMethodResolves: (telemetryEndRequest: TelemetryEndRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
