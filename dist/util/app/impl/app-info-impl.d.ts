import { SdkConfig } from '../../../sdk-config';
import { AppInfo } from '../def/app-info';
export declare class AppInfoImpl implements AppInfo {
    private sdkConfig;
    private versionName;
    constructor(sdkConfig: SdkConfig);
    getVersionName(): string;
    init(): Promise<void>;
    /** @internal */
    getBuildConfigValue(packageName: any, property: any): Promise<string>;
}
