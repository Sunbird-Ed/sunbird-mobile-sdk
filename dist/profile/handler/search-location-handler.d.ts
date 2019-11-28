import { ApiRequestHandler, ApiService } from '../../api';
import { LocationSearchCriteria, ProfileServiceConfig } from '..';
import { LocationSearchResult } from '../def/location-search-result';
import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
export declare class SearchLocationHandler implements ApiRequestHandler<LocationSearchCriteria, LocationSearchResult[]> {
    private apiService;
    private profileServiceConfig;
    private fileService;
    private cachedItemStore;
    private static readonly GET_SEARCH_LOCATION_ENDPOINT;
    private static readonly LOCATION_TTL;
    private readonly LOCATION_LOCAL_KEY;
    constructor(apiService: ApiService, profileServiceConfig: ProfileServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore);
    handle(request: LocationSearchCriteria): Observable<LocationSearchResult[]>;
    private fetchFromServer;
    private fetchFromFile;
}
