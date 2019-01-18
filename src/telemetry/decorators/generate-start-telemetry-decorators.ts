import {TelemetryStartRequest} from '../def/requests';
import {SunbirdSdk} from '../../sdk';
import {
    afterMethodFactory,
    afterMethodResolvesFactory,
    beforeMethodFactory
} from './decorator-factories';
const invokeStart = (telemetryStartRequest: TelemetryStartRequest) => {
    SunbirdSdk.instance.telemetryService.start(
        telemetryStartRequest.pageId,
        telemetryStartRequest.env,
        telemetryStartRequest.mode,
        telemetryStartRequest.object,
        telemetryStartRequest.rollup,
        telemetryStartRequest.corRelationList
    );
};

export const GenerateStartTelemetryAfterMethod = (telemetryStartRequest: TelemetryStartRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodFactory(descriptor, () => {
            invokeStart(telemetryStartRequest);
        });
    };
};

export const GenerateStartTelemetryBeforeMethod = (telemetryStartRequest: TelemetryStartRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return beforeMethodFactory(descriptor, () => {
            invokeStart(telemetryStartRequest);
        });
    };
};

export const GenerateStartTelemetryAfterMethodResolves = (telemetryStartRequest: TelemetryStartRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodResolvesFactory(descriptor, () => {
            invokeStart(telemetryStartRequest);
        });
    };
};
