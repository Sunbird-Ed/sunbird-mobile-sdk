import { Context, SunbirdTelemetry, TelemetryDecorator } from '..';
import { ApiConfig } from '../../api';
import { DeviceInfo } from '../../util/device/def/device-info';
import { AppInfo } from '../../util/app/def/app-info';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    private apiConfig;
    private deviceInfo;
    private appInfo;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo, appInfo: AppInfo);
    decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset?: number): any;
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
