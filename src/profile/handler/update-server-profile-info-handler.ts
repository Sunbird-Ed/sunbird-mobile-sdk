import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UpdateServerProfileInfoRequest} from '..';
import {Profile} from '..';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';

export class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpdateServerProfileInfoRequest, Profile> {
    private readonly GET_SERVER_PROFILE_INFO_API = '/user/v1/update';

    constructor(
        private apiService: ApiService,
        private updateUserInfoConfig: ProfileServiceConfig) {

    }

    public handle(request: UpdateServerProfileInfoRequest): Observable<Profile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.updateUserInfoConfig.apiPath + this.GET_SERVER_PROFILE_INFO_API)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: Profile }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
