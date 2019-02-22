import { ApiRequestHandler, ApiService } from '../../api';
import { Profile, ProfileServiceConfig, UpdateServerProfileInfoRequest } from '..';
import { Observable } from 'rxjs';
export declare class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpdateServerProfileInfoRequest, Profile> {
    private apiService;
    private updateUserInfoConfig;
    private readonly GET_SERVER_PROFILE_INFO_API;
    constructor(apiService: ApiService, updateUserInfoConfig: ProfileServiceConfig);
    handle(request: UpdateServerProfileInfoRequest): Observable<Profile>;
}
