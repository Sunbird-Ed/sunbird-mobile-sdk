import {ApiRequestHandler} from '../../api';
import {ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest} from '..';
import {CachedItemRequest, CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Observable, of, throwError} from 'rxjs';
import {catchError, mergeMap, tap} from 'rxjs/operators';
import {CsInjectionTokens} from '../../injection-tokens';
import {CsUserService} from '@project-sunbird/client-services/services/user';
import {Container} from 'inversify';

export class GetServerProfileDetailsHandler implements ApiRequestHandler<{
    serverProfileDetailsRequest: ServerProfileDetailsRequest,
    cachedItemRequest: CachedItemRequest
}, ServerProfile> {

    private readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'userProfileDetails';

    constructor(
        private cachedItemStore: CachedItemStore,
        private keyValueStore: KeyValueStore,
        private container: Container,
        private profileServiceConfig: ProfileServiceConfig
        ) {
    }

  private get csUserService(): CsUserService {
    return this.container.get(CsInjectionTokens.USER_SERVICE);
  }

    handle(serverProfileDetailsRequest): Observable<ServerProfile> {

        serverProfileDetailsRequest.from = serverProfileDetailsRequest.from || CachedItemRequestSourceFrom.CACHE;

        return of(serverProfileDetailsRequest.from).pipe(
            mergeMap((from: CachedItemRequestSourceFrom) => {
                if (from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(serverProfileDetailsRequest).pipe(
                        tap(async (profile) => {
                            return this.keyValueStore.setValue(
                                this.USER_PROFILE_DETAILS_KEY_PREFIX + '-' + profile.id, JSON.stringify(profile)
                            ).toPromise();
                        }),
                        catchError((error) => {
                            if(serverProfileDetailsRequest.forceRefresh) {
                                 throw error;
                            }
                            return this.fetchFromCache(serverProfileDetailsRequest);
                        })
                    );
                }

                return this.fetchFromCache(serverProfileDetailsRequest);
            })
        );
    }


    private fetchFromServer(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
      return this.csUserService.getProfileDetails(request, { apiPath : this.profileServiceConfig.profileApiPath_V5});
    }

    private fetchFromCache(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return this.cachedItemStore.getCached(
            request.userId,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            () => this.fetchFromServer(request)
        );
    }
}