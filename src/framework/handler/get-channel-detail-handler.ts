import { KeyValueStore } from './../../key-value-store/def/key-value-store';
import { ChannelDetailsRequest } from './../def/request-types';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import { SessionAuthenticator } from 'src/auth';
import { FrameworkServiceConfig, Channel} from '..';


export class GetChannelDetailsHandler implements ApiRequestHandler<ChannelDetailsRequest, Channel> {
    private readonly GET_CHANNEL_DETAILS_ENDPOINT = 'channel/read';
    private readonly DB_KEY_CHANNEL_DETAILS = 'channel_details_key-';


    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    handle(request: ChannelDetailsRequest): Observable<Channel> {
        // read
        return this.keyValueStore.getValue(this.DB_KEY_CHANNEL_DETAILS + request.channelId)
            .mergeMap((v: string | undefined) => {
                if (v) {
                    return Observable.of(JSON.parse(v));
                }
                // TODO need to check expiration time before fetching from server
                return this.fetchFromServer(request)
                    .do((channel: Channel) => {
                        this.keyValueStore.setValue(
                            this.DB_KEY_CHANNEL_DETAILS + request.channelId,
                            JSON.stringify(channel)
                        );
                    });
            });
    }

    private fetchFromServer(request: ChannelDetailsRequest): Observable<Channel> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.apiPath + this.GET_CHANNEL_DETAILS_ENDPOINT + request.channelId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: { response: Channel } }>(apiRequest).map((response) => {
            return response.body.result.response;
        });
        // TODO
        //  if no/error response from server read from file and send back and save to db
    }
}
