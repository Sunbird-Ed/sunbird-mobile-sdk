import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {DeviceRegisterConfig, DeviceRegisterRequest} from '..';
import {Observable} from 'rxjs';
import {DeviceInfo, DeviceSpec} from '../../util/device';
import {AppInfo} from '../../util/app';
import {KeyValueStore} from '../../key-value-store';
import {SdkConfig} from '../../sdk-config';
import {SharedPreferences} from '../../util/shared-preferences';
import {FrameworkService} from '../../framework';

export class DeviceRegisterHandler implements ApiRequestHandler<DeviceRegisterRequest, DeviceRegisterResponse> {

    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';

    private readonly deviceRegisterConfig: DeviceRegisterConfig;
    private readonly apiConfig: ApiConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private deviceInfo: DeviceInfo,
        private frameworkService: FrameworkService,
        private appInfoService: AppInfo,
        private keyValueStore: KeyValueStore,
        private sharedPreferences: SharedPreferences,
        private apiService: ApiService
    ) {
        this.deviceRegisterConfig = this.sdkConfig.deviceRegisterConfig;
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return this.registerDevice(request);
    }

    private registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return Observable.zip(
            this.deviceInfo.getDeviceSpec(),
            this.frameworkService.getActiveChannelId(),
            this.appInfoService.getFirstAccessTimestamp(),
        ).mergeMap((results: any) => {
            const deviceSpec: DeviceSpec = results[0];
            const activeChannelId: string = results[1];
            const firstAccessTimestamp = results[2];

            if (request) {
                request.dspec = deviceSpec;
                request.channel = activeChannelId;
                request.fcmToken = this.deviceRegisterConfig.fcmToken!;
                request.producer = this.apiConfig.api_authentication.producerId;
                request.first_access = Number(firstAccessTimestamp);
            } else {
                request = {
                    dspec: deviceSpec,
                    channel: activeChannelId,
                    fcmToken: this.deviceRegisterConfig.fcmToken!,
                    producer: this.apiConfig.api_authentication.producerId,
                    first_access: Number(firstAccessTimestamp)
                };
            }

            const apiRequest: Request = new Request.Builder()
                .withType(HttpRequestType.POST)
                .withHost(this.deviceRegisterConfig!.deviceRegisterHost)
                .withPath(this.deviceRegisterConfig!.deviceRegisterApiPath +
                    DeviceRegisterHandler.DEVICE_REGISTER_ENDPOINT + '/' + this.deviceInfo!.getDeviceID())
                .withApiToken(true)
                .withBody(request)
                .build();

            return this.apiService!.fetch<DeviceRegisterResponse>(apiRequest)
                .map((res) => {
                    return res.body;
                });
        });
    }

}
