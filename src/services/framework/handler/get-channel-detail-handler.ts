import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../../native/file/def/file-service';
import {Channel, ChannelDetailsRequest} from '..';
import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {Observable} from 'rxjs';
import {SdkConfig} from '../../..';


export class GetChannelDetailsHandler implements ApiRequestHandler<ChannelDetailsRequest, Channel> {
    private readonly CHANNEL_FILE_KEY_PREFIX = 'channel-';
    private readonly CHANNEL_LOCAL_KEY = 'channel-';
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';


    constructor(private apiService: HttpService,
                private sdkConfig: SdkConfig,
                private fileservice: FileService,
                private cachedItemStore: CachedItemStore) {
    }

    handle(request: ChannelDetailsRequest): Observable<Channel> {
        return this.cachedItemStore.getCached(
            request.channelId,
            this.CHANNEL_LOCAL_KEY,
            'ttl_' + this.CHANNEL_LOCAL_KEY,
            () => this.fetchFromServer(request),
            () => this.fetchFromFile(request)
        ).map((channel: Channel) => {
            if (channel.frameworks) {
                const maxIndex: number = channel.frameworks.reduce((acc, val) => (val.index && (val.index > acc)) ? val.index : acc, 0);

                channel.frameworks.sort((i, j) => (i.index || maxIndex + 1) - (j.index || maxIndex + 1));
            }
            return channel;
        });

    }

    private fetchFromServer(request: ChannelDetailsRequest): Observable<Channel> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.sdkConfig.frameworkServiceConfig.channelApiPath + this.GET_FRAMEWORK_DETAILS_ENDPOINT + '/' + request.channelId)
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { channel: Channel } }>(apiRequest).map((response) => {
            return response.body.result.channel;
        });
    }

    private fetchFromFile(request: ChannelDetailsRequest): Observable<Channel> {
        const dir = this.sdkConfig.bootstrapConfig.assetsDir + this.sdkConfig.frameworkServiceConfig.channelConfigDirPath;
        const file = this.CHANNEL_FILE_KEY_PREFIX + request.channelId + '.json';

        return Observable.fromPromise(this.fileservice.readAsText(dir, file))
            .map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return (result.result.channel);
            });
    }

}
