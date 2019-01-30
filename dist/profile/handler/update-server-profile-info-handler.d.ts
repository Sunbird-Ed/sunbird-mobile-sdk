import { ApiRequestHandler, ApiService } from '../../api';
import { UpdateServerProfileInfoRequest } from '../def/update-server-profile-info-request';
import { Profile } from '..';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { Observable } from 'rxjs';
export declare class UpdateServerProfileInfoHandler implements ApiRequestHandler<UpdateServerProfileInfoRequest, Profile> {
    private apiService;
    private updateUserInfoConfig;
    private sessionAuthenticator;
    private readonly GET_SERVER_PROFILE_INFO_API;
    constructor(apiService: ApiService, updateUserInfoConfig: ProfileServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: UpdateServerProfileInfoRequest): Observable<Profile>;
}
