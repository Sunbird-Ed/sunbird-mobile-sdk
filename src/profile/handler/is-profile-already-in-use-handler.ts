import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {IsProfileAlreadyInUseRequest, ProfileServiceConfig} from '..';
import {ProfileExistsResponse} from '../def/profile-exists-response';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class IsProfileAlreadyInUseHandler implements ApiRequestHandler<IsProfileAlreadyInUseRequest, ProfileExistsResponse> {
    private readonly GET_PROFILE_ALREADY_IN_USE_ENDPOINT = '/get';

    constructor(private apiService: ApiService,
                private profileAlreadyInUseConfig: ProfileServiceConfig) {
    }

    handle(request: IsProfileAlreadyInUseRequest): Observable<ProfileExistsResponse> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileAlreadyInUseConfig.profileApiPath_V2 +
                this.GET_PROFILE_ALREADY_IN_USE_ENDPOINT + '/' + request.type + '/' + request.key)
            .withBearerToken(true)
            .withUserToken(true)
            .build();

        return this.apiService.fetch<{ result: ProfileExistsResponse }>(apiRequest).pipe(
            map((success) => {
                return success.body.result;
            })
        );
    }

}
