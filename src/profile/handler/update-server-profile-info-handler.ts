import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UpadateServerProfileInfoRequest} from '../def/upadate-server-profile-info-request';
import {Profile} from '..';
import {KeyValueStore} from '../../key-value-store';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {Observable} from 'rxjs';

export class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpadateServerProfileInfoRequest, Profile[]> {
    private readonly GET_SERVER_PROFILE_INFO_API = '/api/user/v1/update';
    private readonly STORED_UPDATE_SERVER_PROFILE_INFO_PREFIX = 'severProfileInfo_';

    constructor(private  keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private updateUserInfoConfig: ProfileServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {

    }

    public handle(request: UpadateServerProfileInfoRequest): Observable<Profile[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.updateUserInfoConfig.apiPath + this.GET_SERVER_PROFILE_INFO_API + request.userId + '/' + request.frameWork)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: Profile[] }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
