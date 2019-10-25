import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {DeviceProfileResponse, DeviceRegisterConfig} from '..';
import {Observable} from 'rxjs';
import {DeviceInfo} from '../../util/device';
import {SdkConfig} from '../../sdk-config';

export class GetDeviceProfileHandler implements ApiRequestHandler<undefined, DeviceProfileResponse> {

    private static readonly GET_DEVICE_PROFILE_ENDPOINT = '/profile';

    private readonly deviceRegisterConfig: DeviceRegisterConfig;
    private readonly apiConfig: ApiConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private deviceInfo: DeviceInfo,
        private apiService: ApiService
    ) {
        this.deviceRegisterConfig = this.sdkConfig.deviceRegisterConfig;
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(): Observable<DeviceProfileResponse> {
        return this.fetchFromServer();
    }

    fetchFromServer(): Observable<DeviceProfileResponse> {
        return this.apiService.fetch<{ result: DeviceProfileResponse }>(
            new Request.Builder()
                .withHost(this.apiConfig.host)
                .withType(HttpRequestType.GET)
                .withPath(this.deviceRegisterConfig.deviceProfileApiPath + GetDeviceProfileHandler.GET_DEVICE_PROFILE_ENDPOINT
                    + '/' + this.deviceInfo.getDeviceID())
                .withApiToken(true)
                .build()
        ).map((response) => {
            return response.body.result;
        });
    }

}
