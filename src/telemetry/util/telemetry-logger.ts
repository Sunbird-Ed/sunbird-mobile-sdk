import {SunbirdSdk} from '../../sdk';
import {TelemetryService} from '..';

export class TelemetryLogger {
    public static get log(): TelemetryService {
        return SunbirdSdk.instance.telemetryService;
    }
}
