import { Context, CorrelationData, SunbirdTelemetry, TelemetryDecorator } from '..';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { SdkConfig } from '../../sdk-config';
import { CodePushExperimentService } from '../../codepush-experiment';
import { ProfileSession } from '../../profile';
import Telemetry = SunbirdTelemetry.Telemetry;
export declare class TelemetryDecoratorImpl implements TelemetryDecorator {
    private sdkConfig;
    private deviceInfo;
    private appInfo;
    private codePushExperimentService;
    private apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, appInfo: AppInfo, codePushExperimentService: CodePushExperimentService);
    decorate(event: Telemetry, profileSession: ProfileSession, gid?: string, offset?: number, channelId?: string, campaignParameters?: CorrelationData[], globalCData?: CorrelationData[]): any;
    private patchActor;
    private patchContext;
    private patchPData;
    prepare(event: Telemetry, priority: any): {
        event: string;
        event_type: string;
        timestamp: number;
        priority: number;
    };
    buildContext(sid: string, channelId: string, context: Context, campaignParameters?: CorrelationData[], globalCData?: CorrelationData[]): Context;
}
