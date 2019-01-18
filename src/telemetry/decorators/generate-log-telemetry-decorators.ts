import {TelemetryLogRequest} from '../def/requests';
import {SunbirdSdk} from '../../sdk';
import {
    afterMethodResolvesFactory,
    beforeMethodFactory
} from './decorator-factories';
const invokeLog = (telemetryLogRequest: TelemetryLogRequest) => {
    SunbirdSdk.instance.telemetryService.log(
        telemetryLogRequest.logLevel,
        telemetryLogRequest.message,
        telemetryLogRequest.env,
        telemetryLogRequest.type,
        telemetryLogRequest.params
    );
};

export const GenerateLogTelemetryBeforeMethod = (telemetryLogRequest: TelemetryLogRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return beforeMethodFactory(descriptor, () => {
            invokeLog(telemetryLogRequest);
        });
    };
};

export const GenerateLogTelemetryAfterMethodResolves = (telemetryLogRequest: TelemetryLogRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodResolvesFactory(descriptor, () => {
            invokeLog(telemetryLogRequest);
        });
    };
};
