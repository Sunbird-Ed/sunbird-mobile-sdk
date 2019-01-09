import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UpdateUserInfoRequest} from '../def/update-userInfo-request';
import {Profile} from '..';
import {KeyValueStore} from '../../key-value-store';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {Observable} from 'rxjs';

export class UpdateUserInfoHandler implements ApiRequestHandler<UpdateUserInfoRequest, Profile[]> {
    private readonly GET_UPDATE_USERINFO_ENDPOINT = '/api/user/v1/update';
    private readonly STORED_UPDATE_USERINFO_PREFIX = 'updateUserInfo_';

    constructor(private  keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private updateUserInfoConfig: ProfileServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {

    }

    handle(request: UpdateUserInfoRequest): Observable<Profile[]> {
        return this.keyValueStore.getValue(this.STORED_UPDATE_USERINFO_PREFIX + request.userId + request.frameWork)
            .mergeMap((updateInfo: string | undefined) => {
                if (updateInfo) {
                    return Observable.of(JSON.parse(updateInfo));
                }
                return this.fetchFromServer(request)
                    .do((updateUserInfo: Profile[]) => {
                        this.keyValueStore.setValue(this.STORED_UPDATE_USERINFO_PREFIX + request.userId + request.frameWork,
                            JSON.stringify(updateUserInfo));
                    });
            });
    }

    private fetchFromServer(request: UpdateUserInfoRequest): Observable<Profile[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.updateUserInfoConfig.apiPath + this.GET_UPDATE_USERINFO_ENDPOINT + request.userId + request.frameWork)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();
        return this.apiService.fetch <{ result: Profile[] }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
