import { Context, TelemetryDecorator, TelemetryEvents } from '..';
import { ApiConfig } from '../../api';
import { DeviceInfo } from '../../util/device/def/device-info';
import Telemetry = TelemetryEvents.Telemetry;
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    private apiConfig;
    private deviceInfo;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo);
    decorate(event: Telemetry, uid: string, sid: string, gid?: string): any;
    patchActor(event: Telemetry, uid: string): void;
    patchContext(event: Telemetry, sid: any): void;
    patchPData(event: Context): void;
    prepare(event: Telemetry, priority: any): {
        event: string;
        event_type: string;
        timestamp: number;
        priority: number;
    };
}
