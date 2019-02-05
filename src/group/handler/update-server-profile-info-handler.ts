import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UpdateServerProfileInfoRequest} from '../def/update-server-profile-info-request';
import {Profile} from '..';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {Observable} from 'rxjs';

export class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpdateServerProfileInfoRequest, Profile> {
    private readonly GET_SERVER_PROFILE_INFO_API = 'update';

    constructor(
        private apiService: ApiService,
        private updateUserInfoConfig: ProfileServiceConfig,
        private sessionAuthenticator: SessionAuthenticator) {

    }

    public handle(request: UpdateServerProfileInfoRequest): Observable<Profile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.updateUserInfoConfig.apiPath + this.GET_SERVER_PROFILE_INFO_API + request.userId + '/' + request.phone)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: Profile }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
