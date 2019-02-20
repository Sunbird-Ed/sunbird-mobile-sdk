import { TelemetryDecorator, TelemetryEvents } from '..';
import { ApiConfig } from '../../api';
import { DeviceInfo } from '../../util/device/def/device-info';
import { ProfileSession } from '../../profile';
import Telemetry = TelemetryEvents.Telemetry;
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    private apiConfig;
    private deviceInfo;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo);
    decorate(event: Telemetry, profileSession: ProfileSession, groupSession: ProfileSession): any;
    patchActor(event: any, uid: string): void;
    patchContext(event: any, sid: any): void;
    patchPData(event: any): void;
    prepare(event: any): {
        event: string;
        event_type: any;
        timestamp: number;
        priority: number;
    };
}
