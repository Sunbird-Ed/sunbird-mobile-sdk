import { Context, SunbirdTelemetry, TelemetryDecorator } from '..';
import { DeviceInfo } from '../../util/device/def/device-info';
import { AppInfo } from '../../util/app/def/app-info';
import Telemetry = SunbirdTelemetry.Telemetry;
import { SdkConfig } from '../../sdk-config';
import { CodePushExperimentService } from '../../codepush-experiment';
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    private sdkConfig;
    private deviceInfo;
    private appInfo;
    private codePushExperimentService;
    private apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, appInfo: AppInfo, codePushExperimentService: CodePushExperimentService);
    decorate(event: Telemetry, uid: string, sid: string, gid?: string, offset?: number, channelId?: string): any;
    private patchActor;
    private patchContext;
    private patchPData;
    prepare(event: Telemetry, priority: any): {
        event: string;
        event_type: string;
        timestamp: number;
        priority: number;
    };
    buildContext(sid: string, channelId: string, context: Context): Context;
}
