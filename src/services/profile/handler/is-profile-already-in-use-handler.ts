import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {IsProfileAlreadyInUseRequest, ProfileServiceConfig} from '../index';
import {ProfileExistsResponse} from '../def/profile-exists-response';
import {Observable} from 'rxjs';

export class IsProfileAlreadyInUseHandler implements ApiRequestHandler<IsProfileAlreadyInUseRequest, ProfileExistsResponse> {
    private readonly GET_PROFILE_ALREADY_IN_USE_ENDPOINT = '/get';

    constructor(private apiService: HttpService,
                private profileAlreadyInUseConfig: ProfileServiceConfig) {
    }

    handle(request: IsProfileAlreadyInUseRequest): Observable<ProfileExistsResponse> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileAlreadyInUseConfig.profileApiPath +
                this.GET_PROFILE_ALREADY_IN_USE_ENDPOINT + '/' + request.type + '/' + request.key)
            .withApiToken(true)
            .withSessionToken(true)
            .build();

        return this.apiService.fetch<{ result: ProfileExistsResponse }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

}
