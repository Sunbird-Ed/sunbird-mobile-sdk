import { ApiRequestHandler, ApiService } from '../../api';
import { IsProfileAlreadyInUseRequest } from '..';
import { ProfileExistsResponse } from '../def/profile-exists-response';
import { ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class IsProfileAlreadyInUseHandler implements ApiRequestHandler<IsProfileAlreadyInUseRequest, ProfileExistsResponse> {
    private apiService;
    private profileAlreadyInUseConfig;
    private readonly GET_PROFILE_ALREADY_IN_USE_ENDPOINT;
    constructor(apiService: ApiService, profileAlreadyInUseConfig: ProfileServiceConfig);
    handle(request: IsProfileAlreadyInUseRequest): Observable<ProfileExistsResponse>;
}
