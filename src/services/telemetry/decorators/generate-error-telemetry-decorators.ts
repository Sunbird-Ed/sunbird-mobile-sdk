import {TelemetryError, TelemetryErrorRequest} from '../index';
import {afterMethodThrowsFactory} from './decorator-factories';
import {SunbirdSdk} from '../../../sdk';

export const GenerateErrorTelemetryAfterMethodThrows = (telemetryErrorRequest: TelemetryErrorRequest) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return afterMethodThrowsFactory(descriptor, (e: any) => {
            if (e instanceof TelemetryError) {
                SunbirdSdk.instance.telemetryService.error(telemetryErrorRequest).subscribe();
            }
        });
    };
};
