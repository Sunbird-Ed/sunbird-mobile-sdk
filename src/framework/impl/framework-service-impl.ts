import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {
    Channel,
    ChannelDetailsRequest,
    Framework,
    FrameworkDetailsRequest,
    FrameworkService,
    FrameworkServiceConfig,
    GetChannelDetailsHandler,
    GetFrameworkDetailsHandler
} from '..';
import {FileService} from '../../util/file/def/file-service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ApiService} from '../../api';


export class FrameworkServiceImpl implements FrameworkService {
    public activeChannel$: Observable<Channel | undefined>;
    private activeChannelSource: Subject<Channel | undefined>;
    private readonly DB_KEY_FRAMEWORK_DETAILS = 'framework_details_key-';

    constructor(private frameworkServiceConfig: FrameworkServiceConfig,
                private keyValueStore: KeyValueStore,
                private fileService: FileService,
                private apiService: ApiService,
                private cachedChannelItemStore: CachedItemStore<Channel>,
                private cachedFrameworkItemStore: CachedItemStore<Framework>) {
        this.activeChannelSource = new BehaviorSubject<Channel | undefined>(undefined);
        this.activeChannel$ = this.activeChannelSource.asObservable();
    }


    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel> {
        return new GetChannelDetailsHandler(
            this.apiService,
            this.frameworkServiceConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework> {
        return new GetFrameworkDetailsHandler(
            this.apiService,
            this.frameworkServiceConfig,
            this.fileService,
            this.cachedFrameworkItemStore,
        ).handle(request);
    }

    persistFrameworkDetails(request: Framework): Observable<boolean> {
        const frameworkId = request.identifier;
        const key = this.DB_KEY_FRAMEWORK_DETAILS + frameworkId;
        return this.keyValueStore.setValue(key, JSON.stringify(request));
    }

    setActiveChannel(channel: Channel) {
        this.activeChannelSource.next(channel);
    }
}
