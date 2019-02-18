import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {LocationSearchCriteria} from '..';
import {LocationSearchResult} from '../def/location-search-result';
import {Observable} from 'rxjs';
import {ProfileServiceConfig} from '..';

export class SearchLocationHandler implements ApiRequestHandler<LocationSearchCriteria, LocationSearchResult> {
    private readonly GET_SEARCH_LOCATION_ENDPOINT = '/location/search';

    constructor(private apiService: ApiService,
                private locationSearchApiConfig: ProfileServiceConfig) {
    }

    handle(request: LocationSearchCriteria): Observable<LocationSearchResult> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.locationSearchApiConfig.searchLocationApiPath + this.GET_SEARCH_LOCATION_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({
                request: {
                    filters: {
                        type: request.type
                    }
                }
            })
            .build();

        return this.apiService.fetch<{ result: { response: LocationSearchResult } }>(apiRequest).map((success) => {
            return success.body.result.response;
        });
    }

}
