import { CachedItemStore } from './../../key-value-store/def/cached-item-store';
import { FrameworkServiceConfig, Channel, Framework } from '..';
import { GetChannelDetailsHandler } from './../handler/get-channel-detail-handler';
import { FileService } from './../../util/file/def/file-service';
import { KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { ChannelDetailsRequest, FrameworkDetailsRequest } from './../def/request-types';
import { FrameworkService } from '../def/framework-service';
import { SessionAuthenticator } from 'src/auth';
import { ApiService } from 'src/api';
import { GetFrameworkDetailsHandler } from '../handler/get-framework-detail-handler';



export class FrameworkServiceImpl implements FrameworkService {

    DB_KEY_CHANNEL_DETAILS = 'channel_details_key-';
    DB_KEY_FRAMEWORK_DETAILS = 'framework_details_key-';

    constructor(private keyValueStore: KeyValueStore,
        private fileService: FileService,
        private frameworkServiceConfig: FrameworkServiceConfig,
        private sessionAuthenticator: SessionAuthenticator,
        private apiService: ApiService,
        private cachedChannelItemStore: CachedItemStore<Channel>,
        private cachedFrameworkItemStore: CachedItemStore<Framework>) {
    }


    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel> {
        return new GetChannelDetailsHandler(
            this.apiService,
            this.frameworkServiceConfig,
            this.sessionAuthenticator,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework> {
        return new GetFrameworkDetailsHandler(
            this.apiService,
            this.frameworkServiceConfig,
            this.sessionAuthenticator,
            this.fileService,
            this.cachedFrameworkItemStore,
        ).handle(request);
    }

    persistFrameworkDetails(request: Framework): Observable<boolean> {
        const frameworkId = request.framework.identifier;
        const key = this.DB_KEY_FRAMEWORK_DETAILS + frameworkId;
        return this.keyValueStore.setValue(key, JSON.stringify(request));
    }

}
