import {TelemetryEndRequest} from '../def/requests';
import {SunbirdSdk} from '../../sdk';
import {
    afterMethodFactory,
    afterMethodResolvesFactory,
    beforeMethodFactory
} from './decorator-factories';
const invokeEnd = (telemetryEndRequest: TelemetryEndRequest) => {
    SunbirdSdk.instance.telemetryService.end(
        telemetryEndRequest.objectType,
        telemetryEndRequest.mode,
        telemetryEndRequest.pageId,
        telemetryEndRequest.env,
        telemetryEndRequest.object,
        telemetryEndRequest.rollup,
        telemetryEndRequest.corRelationList
    );
};

export const GenerateEndTelemetryAfterMethod = (telemetryEndRequest: TelemetryEndRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodFactory(descriptor, () => {
            invokeEnd(telemetryEndRequest);
        });
    };
};

export const GenerateEndTelemetryBeforeMethod = (telemetryEndRequest: TelemetryEndRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return beforeMethodFactory(descriptor, () => {
            invokeEnd(telemetryEndRequest);
        });
    };
};

export const GenerateEndTelemetryAfterMethodResolves = (telemetryEndRequest: TelemetryEndRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodResolvesFactory(descriptor, () => {
            invokeEnd(telemetryEndRequest);
        });
    };
};
