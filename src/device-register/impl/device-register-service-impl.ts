import {DeviceRegisterService} from '../def/device-register-service';
import {DeviceRegisterRequest, DeviceRegisterResponse} from '..';
import {Observable} from 'rxjs';
import {inject, injectable} from 'inversify';
import {DeviceRegisterHandler} from '../handler/device-register-handler';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {AppInfo} from '../../util/app';
import {KeyValueStore} from '../../key-value-store';
import {ApiService} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';
import {FrameworkService} from '../../framework';

@injectable()
export class DeviceRegisterServiceImpl implements DeviceRegisterService {

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.APP_INFO) private appInfoService: AppInfo,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
    ) {
    }

    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return new DeviceRegisterHandler(this.sdkConfig, this.deviceInfo, this.frameworkService, this.appInfoService, this.keyValueStore,
            this.sharedPreferences, this.apiService)
            .handle(request);
    }

}
