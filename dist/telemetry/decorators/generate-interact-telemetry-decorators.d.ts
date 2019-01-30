import { TelemetryInteractRequest } from '..';
export declare const GenerateInteractTelemetryAfterMethod: (telemetryInteractRequest: TelemetryInteractRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateInteractTelemetryBeforeMethod: (telemetryInteractRequest: TelemetryInteractRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateInteractTelemetryAfterMethodResolves: (telemetryInteractRequest: TelemetryInteractRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const GenerateInteractTelemetryAfterMethodRejects: (telemetryInteractRequest: TelemetryInteractRequest) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
