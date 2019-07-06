import {TelemetryInteractRequest} from '../index';
import {SunbirdSdk} from '../../../sdk';
import {afterMethodFactory, afterMethodRejectsFactory, afterMethodResolvesFactory, beforeMethodFactory} from './decorator-factories';

const invokeInteract = (telemetryInteractRequest: TelemetryInteractRequest) => {
    SunbirdSdk.instance.telemetryService.interact(
        telemetryInteractRequest
    ).subscribe();
};

export const GenerateInteractTelemetryAfterMethod = (telemetryInteractRequest: TelemetryInteractRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodFactory(descriptor, () => {
            invokeInteract(telemetryInteractRequest);
        });
    };
};

export const GenerateInteractTelemetryBeforeMethod = (telemetryInteractRequest: TelemetryInteractRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return beforeMethodFactory(descriptor, () => {
            invokeInteract(telemetryInteractRequest);
        });
    };
};

export const GenerateInteractTelemetryAfterMethodResolves = (telemetryInteractRequest: TelemetryInteractRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodResolvesFactory(descriptor, () => {
            invokeInteract(telemetryInteractRequest);
        });
    };
};

export const GenerateInteractTelemetryAfterMethodRejects = (telemetryInteractRequest: TelemetryInteractRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodRejectsFactory(descriptor, () => {
            invokeInteract(telemetryInteractRequest);
        });
    };
};
