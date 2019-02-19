import { ApiRequestHandler, ApiService } from '../../api';
import { LocationSearchCriteria } from '..';
import { LocationSearchResult } from '../def/location-search-result';
import { Observable } from 'rxjs';
import { ProfileServiceConfig } from '..';
export declare class SearchLocationHandler implements ApiRequestHandler<LocationSearchCriteria, LocationSearchResult> {
    private apiService;
    private locationSearchApiConfig;
    private readonly GET_SEARCH_LOCATION_ENDPOINT;
    constructor(apiService: ApiService, locationSearchApiConfig: ProfileServiceConfig);
    handle(request: LocationSearchCriteria): Observable<LocationSearchResult>;
}
