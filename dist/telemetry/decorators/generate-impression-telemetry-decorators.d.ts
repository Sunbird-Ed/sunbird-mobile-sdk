import { TelemetryImpressionRequest } from '../def/requests';
export declare const GenerateImpressionTelemetryAfterMethod: (telemetryImpressionRequest: TelemetryImpressionRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateImpressionTelemetryBeforeMethod: (telemetryImpressionRequest: TelemetryImpressionRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateImpressionTelemetryAfterMethodResolves: (telemetryImpressionRequest: TelemetryImpressionRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
