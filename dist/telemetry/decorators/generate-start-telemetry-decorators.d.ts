import { TelemetryStartRequest } from '../def/requests';
export declare const GenerateStartTelemetryAfterMethod: (telemetryStartRequest: TelemetryStartRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateStartTelemetryBeforeMethod: (telemetryStartRequest: TelemetryStartRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateStartTelemetryAfterMethodResolves: (telemetryStartRequest: TelemetryStartRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
