import {TelemetryInteractRequest} from '../def/requests';
import {afterMethodThrowsFactory} from './decorator-factories';
import {SunbirdSdk} from '../../sdk';
import {TelemetryError} from '../def/telemetry-error';

export const GenerateErrorTelemetryAfterMethodThrows = (telemetryInteractRequest: TelemetryInteractRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodThrowsFactory(descriptor, (e: any) => {
            if (e instanceof TelemetryError) {
                SunbirdSdk.instance.telemetryService.error(
                    telemetryInteractRequest.env, e.errorCode, e.errorType, telemetryInteractRequest.pageId, e.stack!);
            }
        });
    };
};
