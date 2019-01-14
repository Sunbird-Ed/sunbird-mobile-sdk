import { KeyValueStore } from './../../key-value-store/def/key-value-store';
import { FrameworkDetailsRequest } from './../def/request-types';
import { Framework } from './../def/framework';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import { SessionAuthenticator } from 'src/auth';
import { FrameworkServiceConfig } from '../config/framework-service-config';

export class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT = 'framework/read';
    private readonly DB_KEY_FRAMEWORK_DETAILS = 'framework_details_key-';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }
    handle(request: FrameworkDetailsRequest): Observable<Framework> {
        return this.keyValueStore.getValue(this.DB_KEY_FRAMEWORK_DETAILS + request.frameworkId)
            .mergeMap((v: string | undefined) => {
                if (v) {
                    return Observable.of(JSON.parse(v));
                }
                // TODO need to check expiration time before fetching from server 
                return this.fetchFromServer(request)
                    .do((framework: Framework) => {
                        this.keyValueStore.setValue(
                            this.DB_KEY_FRAMEWORK_DETAILS + request.frameworkId,
                            JSON.stringify(framework)
                        );
                    });
            });
    }

    private fetchFromServer(request: FrameworkDetailsRequest): Observable<Framework> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.apiPath + this.GET_FRAMEWORK_DETAILS_ENDPOINT + request.frameworkId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: { response: Framework } }>(apiRequest).map((response) => {
            return response.body.result.response;
        });
        // TODO
        // if no/error response from server read from file and send back and save to db
    }
}
