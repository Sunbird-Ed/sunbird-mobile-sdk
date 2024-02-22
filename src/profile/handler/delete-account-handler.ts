import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { DeleteUserRequest } from '../def/delete-user-request';

export class DeleteAccountHandler implements ApiRequestHandler<DeleteUserRequest, boolean> {
    private readonly DELETE_ENDPOINT = '/delete';

    constructor(private apiService: ApiService,
                private profileServiceConfig: ProfileServiceConfig) {
    }

    handle(request: DeleteUserRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.profileApiPath + this.DELETE_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({ request: request })
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response === 'SUCCESS';
            })
        );
    }

}