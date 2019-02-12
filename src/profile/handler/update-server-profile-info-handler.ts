import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Profile, ProfileServiceConfig, UpdateServerProfileInfoRequest} from '..';
import {Observable} from 'rxjs';

export class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpdateServerProfileInfoRequest, Profile> {
    private readonly GET_SERVER_PROFILE_INFO_API = '/update';

    constructor(
        private apiService: ApiService,
        private updateUserInfoConfig: ProfileServiceConfig) {

    }

    public handle(request: UpdateServerProfileInfoRequest): Observable<Profile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.updateUserInfoConfig.profileApiPath + this.GET_SERVER_PROFILE_INFO_API)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: Profile }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
