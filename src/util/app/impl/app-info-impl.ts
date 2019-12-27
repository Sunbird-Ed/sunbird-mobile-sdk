import {SdkConfig} from '../../../sdk-config';
import {AppInfo} from '..';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SharedPreferences} from '../../shared-preferences';
import {AppInfoKeys} from '../../../preference-keys';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@injectable()
export class AppInfoImpl implements AppInfo {

    private versionName: string;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences
    ) {
        if (sdkConfig.platform !== 'cordova') {
            this.versionName = 'sunbird-debug';
        }
    }

    getVersionName(): string {
        return this.versionName;
    }

    public async init(): Promise<void> {
        await this.setFirstAccessTimestamp();
        if (this.sdkConfig.platform !== 'cordova') {
            return undefined;
        }
        const packageName = this.sdkConfig.appConfig.buildConfigPackage ? this.sdkConfig.appConfig.buildConfigPackage : 'org.sunbird.app';
        return this.getBuildConfigValue(packageName, 'VERSION_NAME')
            .then((versionName) => {
                this.versionName = versionName;
                console.log('version name', this.versionName);
                return;
            });
    }

    /** @internal */
    getBuildConfigValue(packageName, property): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                buildconfigreader.getBuildConfigValue(packageName, property, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    /** @internal */
    getFirstAccessTimestamp(): Observable<string> {
        return this.sharedPreferences.getString(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP)
            .pipe(
                map((ts) => ts!)
            );
    }

    private async setFirstAccessTimestamp(): Promise<boolean> {
        const timestamp = await this.sharedPreferences.getString(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP).toPromise();
        if (!timestamp) {
            await this.sharedPreferences.putString(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP, Date.now() + '').toPromise();
            return true;
        }
        return false;
    }
}
