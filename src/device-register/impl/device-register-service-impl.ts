import {DeviceProfileResponse, DeviceRegisterRequest, DeviceRegisterResponse, DeviceRegisterService} from '..';
import {Observable} from 'rxjs';
import {inject, injectable} from 'inversify';
import {DeviceRegisterHandler} from '../handler/device-register-handler';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {AppInfo} from '../../util/app';
import {ApiService} from '../../api';
import {FrameworkService} from '../../framework';
import {GetDeviceProfileHandler} from '../handler/get-device-profile-handler';

@injectable()
export class DeviceRegisterServiceImpl implements DeviceRegisterService {

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.APP_INFO) private appInfoService: AppInfo,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
    ) {
    }

    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return new DeviceRegisterHandler(this.sdkConfig, this.deviceInfo, this.frameworkService, this.appInfoService, this.apiService)
            .handle(request);
    }

    getDeviceProfile(): Observable<DeviceProfileResponse> {
        return new GetDeviceProfileHandler(this.sdkConfig, this.deviceInfo, this.apiService)
            .handle();
    }

}
