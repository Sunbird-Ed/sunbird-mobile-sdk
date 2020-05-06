import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {DeviceProfileResponse, DeviceRegisterConfig} from '..';
import {Observable} from 'rxjs';
import {DeviceInfo} from '../../util/device';
import {SdkConfig} from '../../sdk-config';
import {map} from 'rxjs/operators';

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
                .withType(HttpRequestType.GET)
                .withPath(this.deviceRegisterConfig.apiPath + GetDeviceProfileHandler.GET_DEVICE_PROFILE_ENDPOINT
                    + '/' + this.deviceInfo.getDeviceID())
                .withBearerToken(true)
                .build()
        ).pipe(
            map((response) => {
                return response.body.result;
            })
        );
    }

}
