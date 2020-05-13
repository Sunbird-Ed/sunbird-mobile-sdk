import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {DeviceRegisterConfig, DeviceRegisterRequest, DeviceRegisterResponse, UserDeclaredLocation} from '..';
import {Observable, zip} from 'rxjs';
import {DeviceInfo, DeviceSpec} from '../../util/device';
import {AppInfo} from '../../util/app';
import {SdkConfig} from '../../sdk-config';
import {FrameworkService} from '../../framework';
import {SharedPreferences} from '../../util/shared-preferences';
import {DeviceRegister} from '../../preference-keys';
import {map, mergeMap, tap} from 'rxjs/operators';
import {GetDeviceProfileHandler} from './get-device-profile-handler';

export class DeviceRegisterHandler implements ApiRequestHandler<DeviceRegisterRequest, DeviceRegisterResponse> {

    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';

    private readonly deviceRegisterConfig: DeviceRegisterConfig;
    private readonly apiConfig: ApiConfig;

    constructor(
        private sdkConfig: SdkConfig,
        private deviceInfo: DeviceInfo,
        private sharedPreferences: SharedPreferences,
        private frameworkService: FrameworkService,
        private appInfoService: AppInfo,
        private apiService: ApiService,
        private getDeviceProfileHandler: GetDeviceProfileHandler
    ) {
        this.deviceRegisterConfig = this.sdkConfig.deviceRegisterConfig;
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    handle(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return this.registerDevice(request);
    }

    private registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse> {
        return zip(
            this.deviceInfo.getDeviceSpec(),
            this.frameworkService.getActiveChannelId(),
            this.appInfoService.getFirstAccessTimestamp(),
            this.sharedPreferences.getString(DeviceRegister.DEVICE_LOCATION)
        )
            .pipe(
                mergeMap(async (results: any) => {
                    const deviceSpec: DeviceSpec = results[0];
                    const activeChannelId: string = results[1];
                    const firstAccessTimestamp = results[2];
                    const deviceLocation: string | undefined = results[3];

                    request = {
                        ...(request || {}),
                        dspec: deviceSpec,
                        channel: activeChannelId,
                        fcmToken: this.deviceRegisterConfig.fcmToken!,
                        producer: this.apiConfig.api_authentication.producerId,
                        first_access: Number(firstAccessTimestamp)
                    };

                    if (!request.userDeclaredLocation && deviceLocation) {
                        request.userDeclaredLocation = JSON.parse(deviceLocation) as UserDeclaredLocation;

                        if (!request.userDeclaredLocation.declaredOffline) {
                            try {
                                const deviceProfile = await this.getDeviceProfileHandler.handle().toPromise();

                                if (
                                    !deviceProfile.userDeclaredLocation ||
                                    !deviceProfile.userDeclaredLocation.state ||
                                    !deviceProfile.userDeclaredLocation.district
                                ) {
                                    delete request.userDeclaredLocation;

                                    this.sharedPreferences.putString(
                                        DeviceRegister.DEVICE_LOCATION,
                                        ''
                                    ).toPromise();
                                }
                            } catch (e) {
                                console.error(e);
                                delete request.userDeclaredLocation;
                            }
                        }
                    }

                    if (request.userDeclaredLocation) {
                        delete request.userDeclaredLocation.declaredOffline;
                    }

                    const apiRequest: Request = new Request.Builder()
                        .withType(HttpRequestType.POST)
                        .withPath(this.deviceRegisterConfig!.apiPath + DeviceRegisterHandler.DEVICE_REGISTER_ENDPOINT
                            + '/' + this.deviceInfo!.getDeviceID())
                        .withBearerToken(true)
                        .withBody({request: request})
                        .build();

                    return this.apiService!.fetch<DeviceRegisterResponse>(apiRequest)
                        .pipe(
                            map((res) => {
                                return res.body;
                            }),
                            tap(() => {
                                if (request!.userDeclaredLocation) {
                                    this.sharedPreferences.putString(
                                        DeviceRegister.DEVICE_LOCATION,
                                        JSON.stringify(request!.userDeclaredLocation)
                                    ).toPromise();
                                }
                            })
                        )
                        .toPromise();
                })
            );
    }

}
