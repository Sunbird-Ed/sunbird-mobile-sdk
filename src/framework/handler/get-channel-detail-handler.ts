import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {Path} from '../../util/file/util/path';
import {Channel, ChannelDetailsRequest, FrameworkServiceConfig} from '..';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';


export class GetChannelDetailsHandler implements ApiRequestHandler<ChannelDetailsRequest, Channel> {
    private readonly GET_CHANNEL_DETAILS_ENDPOINT = '/read';
    private readonly DB_KEY_CHANNEL_DETAILS = 'channel_details_key';
    private readonly CHANNEL_DETAILS_API_EXPIRATION_KEY = 'CHANNEL_DETAILS_API_EXPIRATION_KEY';


    constructor(private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private fileservice: FileService,
                private cachedItemStore: CachedItemStore<Channel>) {
    }

    handle(request: ChannelDetailsRequest): Observable<Channel> {
        return this.cachedItemStore.getCached(
            request.channelId,
            this.DB_KEY_CHANNEL_DETAILS,
            this.CHANNEL_DETAILS_API_EXPIRATION_KEY,
            () => this.fetchFromServer(request),
            () => this.fetchFromFile()
        );
    }

    private fetchFromServer(request: ChannelDetailsRequest): Observable<Channel> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.channelApiPath + this.GET_CHANNEL_DETAILS_ENDPOINT + '/' +  request.channelId)
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { channel: Channel } }>(apiRequest).map((response) => {
            return response.body.result.channel;
        });
    }

    private fetchFromFile(): Observable<Channel> {
        const fileDirPath = Path.dirPathFromFilePath(this.frameworkServiceConfig.channelConfigFilePath);
        const filePath = Path.fileNameFromFilePath(this.frameworkServiceConfig.channelConfigFilePath);
        return Observable.fromPromise(this.fileservice.readAsText(fileDirPath, filePath))
            .map((filecontent) => {
                const result = JSON.parse(filecontent);
                console.log('fetchFromFile channel', result);
                return (result.result.channel);
            });
    }

}
