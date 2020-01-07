import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {DeviceRegisterConfig, DeviceRegisterRequest, DeviceRegisterResponse} from '..';
import {Observable, zip} from 'rxjs';
import {DeviceInfo, DeviceSpec} from '../../util/device';
import {AppInfo} from '../../util/app';
import {SdkConfig} from '../../sdk-config';
import {FrameworkService} from '../../framework';
import {SharedPreferences} from '../../util/shared-preferences';
import {DeviceRegister} from '../../preference-keys';
import {map, mergeMap} from 'rxjs/operators';
import {LocationSearchCriteria, ProfileService} from '../../profile';
import {LocationSearchResult} from '../../profile/def/location-search-result';

enum Location {
    TYPE_STATE = 'state',
    TYPE_DISTRICT = 'district'
}

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
        private profileService: ProfileService
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
                    const deviceLocation = results[3];

                    request = {
                        ...(request || {}),
                        dspec: deviceSpec,
                        channel: activeChannelId,
                        fcmToken: this.deviceRegisterConfig.fcmToken!,
                        producer: this.apiConfig.api_authentication.producerId,
                        first_access: Number(firstAccessTimestamp)
                    };

                    if (!request.userDeclaredLocation && deviceLocation) {
                        request.userDeclaredLocation = JSON.parse(deviceLocation);
                    }

                    if (request.userDeclaredLocation) {
                        try {
                            if (!(await this.validateLocation(request))) {
                                this.sharedPreferences.putString(DeviceRegister.DEVICE_LOCATION, '').toPromise();
                                delete request.userDeclaredLocation;
                            }
                        } catch (e) {
                            console.error(e);
                            delete request.userDeclaredLocation;
                        }
                    }

                    const apiRequest: Request = new Request.Builder()
                        .withType(HttpRequestType.POST)
                        .withHost(this.deviceRegisterConfig!.host)
                        .withPath(this.deviceRegisterConfig!.apiPath + DeviceRegisterHandler.DEVICE_REGISTER_ENDPOINT
                            + '/' + this.deviceInfo!.getDeviceID())
                        .withApiToken(true)
                        .withBody({request: request})
                        .build();

                    return this.apiService!.fetch<DeviceRegisterResponse>(apiRequest)
                        .pipe(
                            map((res) => {
                                return res.body;
                            })
                        )
                        .toPromise();
                })
            );
    }

    private async validateLocation(request: DeviceRegisterRequest): Promise<boolean> {
        if (
            !request.userDeclaredLocation ||
            !request.userDeclaredLocation.state ||
            !request.userDeclaredLocation.district
        ) {
            return false;
        }

        const fetchStatesRequest: LocationSearchCriteria = {
            filters: {
                type: Location.TYPE_STATE
            }
        };

        const stateList: LocationSearchResult[] = await this.profileService.searchLocation(fetchStatesRequest).toPromise();
        const state = stateList.find((s) => s.name === request.userDeclaredLocation!.state);

        if (!state) {
            return false;
        }

        const fetchDistrictRequest: LocationSearchCriteria = {
            filters: {
                type: Location.TYPE_DISTRICT,
                parentId: state.id
            }
        };

        const districtList: LocationSearchResult[] = await this.profileService.searchLocation(fetchDistrictRequest).toPromise();
        const district = districtList.find((d) => d.name === request.userDeclaredLocation!.district);

        return !!district;
    }
}
