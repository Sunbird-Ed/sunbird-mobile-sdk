import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {LocationSearchCriteria, ProfileServiceConfig} from '../index';
import {LocationSearchResult} from '../def/location-search-result';
import {Observable} from 'rxjs';

export class SearchLocationHandler implements ApiRequestHandler<LocationSearchCriteria, LocationSearchResult[]> {
    private readonly GET_SEARCH_LOCATION_ENDPOINT = '/location/search';

    constructor(private apiService: HttpService,
                private locationSearchApiConfig: ProfileServiceConfig) {
    }

    handle(request: LocationSearchCriteria): Observable<LocationSearchResult[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.locationSearchApiConfig.searchLocationApiPath + this.GET_SEARCH_LOCATION_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: LocationSearchResult[] } }>(apiRequest).map((success) => {
            return success.body.result.response;
        });
    }

}
