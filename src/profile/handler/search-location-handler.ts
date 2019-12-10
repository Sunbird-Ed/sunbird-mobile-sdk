import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {LocationSearchCriteria, ProfileServiceConfig} from '..';
import {LocationSearchResult} from '../def/location-search-result';
import {Observable} from 'rxjs';
import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {Path} from '../../util/file/util/path';

export class SearchLocationHandler implements ApiRequestHandler<LocationSearchCriteria, LocationSearchResult[]> {
    private static readonly GET_SEARCH_LOCATION_ENDPOINT = '/location/search';
    private static readonly LOCATION_TTL = 24 * 60 * 60 * 1000; // 1 day

    private readonly LOCATION_LOCAL_KEY = 'location-';

    constructor(private apiService: ApiService,
                private profileServiceConfig: ProfileServiceConfig,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore) {
    }

    handle(request: LocationSearchCriteria): Observable<LocationSearchResult[]> {

        let id = request.filters.type;
        if (request.filters.parentId) {
            id = id + '_' + request.filters.parentId;
        }
        return this.cachedItemStore.getCached(
            id,
            this.LOCATION_LOCAL_KEY,
            'ttl_' + this.LOCATION_LOCAL_KEY,
            () => this.fetchFromServer(request),
            () => this.fetchFromFile(request),
            SearchLocationHandler.LOCATION_TTL);
    }

    private fetchFromServer(request: LocationSearchCriteria): Observable<LocationSearchResult[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.searchLocationApiPath + SearchLocationHandler.GET_SEARCH_LOCATION_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(false)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: LocationSearchResult[] } }>(apiRequest)
            .map((success) => {
                return success.body.result.response;
            });
    }

    private fetchFromFile(request: LocationSearchCriteria): Observable<LocationSearchResult[]> {
        const dir = Path.ASSETS_PATH + this.profileServiceConfig.locationDirPath;

        let file = request.filters.type;
        if (request.filters.parentId) {
            file = file + '-' + request.filters.parentId;
        }
        file = file + '.json';

        return Observable.fromPromise(this.fileService.readFileFromAssets(dir.concat('/', file)))
            .map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return result.result.response;
            });
    }

}
