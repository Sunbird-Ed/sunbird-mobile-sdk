import {TelemetryImpressionRequest} from '../def/requests';
import {SunbirdSdk} from '../../sdk';
import {afterMethodFactory, afterMethodResolvesFactory, beforeMethodFactory} from './decorator-factories';

const invokeImpression = (telemetryImpressionRequest: TelemetryImpressionRequest) => {
    SunbirdSdk.instance.telemetryService.impression(
        telemetryImpressionRequest
    ).subscribe();
};

export const GenerateImpressionTelemetryAfterMethod = (telemetryImpressionRequest: TelemetryImpressionRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodFactory(descriptor, () => {
            invokeImpression(telemetryImpressionRequest);
        });
    };
};

export const GenerateImpressionTelemetryBeforeMethod = (telemetryImpressionRequest: TelemetryImpressionRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return beforeMethodFactory(descriptor, () => {
            invokeImpression(telemetryImpressionRequest);
        });
    };
};

export const GenerateImpressionTelemetryAfterMethodResolves = (telemetryImpressionRequest: TelemetryImpressionRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodResolvesFactory(descriptor, () => {
            invokeImpression(telemetryImpressionRequest);
        });
    };
};
