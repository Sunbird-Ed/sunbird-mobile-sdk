import {SdkConfig} from '../../../sdk-config';
import {AppInfo} from '../def/app-info';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';

@injectable()
export class AppInfoImpl implements AppInfo {

    private versionName: string;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        if (sdkConfig.httpConfig.debugMode) {
            this.versionName = 'sunbird-debug';
        }
    }

    getVersionName(): string {
        return this.versionName;
    }

    public async init(): Promise<void> {
        if (this.sdkConfig.httpConfig.debugMode) {
            return await undefined;
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

}
