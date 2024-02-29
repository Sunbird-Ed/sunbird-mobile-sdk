import { ApiRequestHandler, ApiService } from '../../api';
import { DeleteUserRequest } from '../def/delete-user-request';
import { ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class DeleteAccountHandler implements ApiRequestHandler<DeleteUserRequest, boolean> {
    private apiService;
    private optServiceConfig;
    private readonly DELETE_ENDPOINT;
    constructor(apiService: ApiService, optServiceConfig: ProfileServiceConfig);
    handle(request: DeleteUserRequest): Observable<boolean>;
}
