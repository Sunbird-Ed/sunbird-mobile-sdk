import { TelemetryLogRequest } from '../def/requests';
export declare const GenerateLogTelemetryBeforeMethod: (telemetryLogRequest: TelemetryLogRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateLogTelemetryAfterMethodResolves: (telemetryLogRequest: TelemetryLogRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
