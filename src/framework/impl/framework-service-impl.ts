import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {
    Channel,
    ChannelDetailsRequest,
    Framework,
    FrameworkDetailsRequest,
    FrameworkService,
    FrameworkServiceConfig,
    OrganizationSearchCriteria
} from '..';
import { GetChannelDetailsHandler } from '../handler/get-channel-detail-handler';
import { GetFrameworkDetailsHandler } from '../handler/get-framework-detail-handler';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import { Organization } from '../def/Organization';
import { ApiService, HttpRequestType, Request} from '../../api';


export class FrameworkServiceImpl implements FrameworkService {

    DB_KEY_FRAMEWORK_DETAILS = 'framework_details_key-';
    private readonly SEARCH_ORGANIZATION_ENDPOINT = '/search';

    constructor(private frameworkServiceConfig: FrameworkServiceConfig,
                private keyValueStore: KeyValueStore,
                private fileService: FileService,
                private apiService: ApiService,
                private cachedChannelItemStore: CachedItemStore<Channel>,
                private cachedFrameworkItemStore: CachedItemStore<Framework>) {
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

    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.frameworkServiceConfig.searchOrganizationApiPath + this.SEARCH_ORGANIZATION_ENDPOINT)
            .withBody({request})
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { response: Organization<T> } }>(apiRequest).map((response) => {
            return response.body.result.response;
        });
    }

}
