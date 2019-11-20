import { SdkConfig } from '../../../sdk-config';
import { AppInfo } from '..';
import { SharedPreferences } from '../../shared-preferences';
import { Observable } from 'rxjs';
export declare class AppInfoImpl implements AppInfo {
    private sdkConfig;
    private sharedPreferences;
    private versionName;
    constructor(sdkConfig: SdkConfig, sharedPreferences: SharedPreferences);
    getVersionName(): string;
    init(): Promise<void>;
    /** @internal */
    getBuildConfigValue(packageName: any, property: any): Promise<string>;
    /** @internal */
    getFirstAccessTimestamp(): Observable<string>;
    private setFirstAccessTimestamp;
}
