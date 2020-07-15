import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {DbService} from '../../../db';
import {NetworkQueueEntry} from '../db/schema';
import {NetworkQueue, NetworkQueueRequest} from '../def/network-queue';
import {Request as NetworkRequest, Request} from '../..';
import {Observable} from 'rxjs';
import {ApiKeys, AuthKeys} from '../../../preference-keys';
import {map, mergeMap} from 'rxjs/operators';
import {SharedPreferences} from '../../../util/shared-preferences';
import {OAuthSession} from '../../../auth';
import {DeviceInfo} from '../../../util/device';
import {SdkConfig} from '../../../sdk-config';

@injectable()
export class NetworkQueueImpl implements NetworkQueue {
  constructor(
    @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
    @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
    @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
    @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
  ) {
  }

  enqueue(request: NetworkQueueRequest, shouldSync: boolean): Observable<undefined> {
    const body = this.getTypeOf(request.networkRequest.body) === 'Uint8Array' ?
      request.networkRequest.body['buffer'] : request.networkRequest.body;
    return new Observable((observer) => {
      (async () => {
        request.networkRequest = await this.interceptRequest(request.networkRequest).toPromise();
        sbsync.enqueue(body, NetworkQueueEntry.Mapper.networkQueueRequestToEntry(request), shouldSync, () => {
            observer.next(undefined);
            observer.complete();
          },
          (err) => {
            observer.error(err);
          });

      })();
    });
  }

  private interceptRequest(request: Request): Observable<NetworkRequest> {
    return this.sharedPreferences.getString(ApiKeys.KEY_API_TOKEN)
      .pipe(
        map((bearerToken) => {
          if (bearerToken) {
            const existingHeaders = request.headers;
            existingHeaders['Authorization'] = `Bearer ${bearerToken}`;
            request.headers = existingHeaders;
          }

          return request;
        }),
        mergeMap(() => {
          return this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION)
            .pipe(
              map((stringifiedSessionData?: string) => {
                if (stringifiedSessionData) {
                  const sessionData: OAuthSession = JSON.parse(stringifiedSessionData);

                  const existingHeaders = request.headers;
                  existingHeaders['X-Authenticated-User-Token'] = sessionData.access_token;
                  if (sessionData.managed_access_token) {
                    existingHeaders['X-Authenticated-For'] = sessionData.managed_access_token;
                  }

                  request.headers = existingHeaders;
                }

                return request;
              })
            );
        }),
        map(() => {
          request.headers['X-Channel-Id'] = this.sdkConfig.apiConfig.api_authentication.channelId;
          request.headers['X-App-Id'] = this.sdkConfig.apiConfig.api_authentication.producerId;
          request.headers['X-Device-Id'] = this.deviceInfo.getDeviceID();
          request.headers['Accept'] = 'application/json';
          request.headers['Content-Type'] = 'application/json';
          request.headers['Access-Control-Allow-Origin'] = '*';
          request.body = {};
          const apiRequest: Request = new Request.Builder()
            .withSerializer(request.serializer)
            .withHost(this.sdkConfig.apiConfig.host)
            .withType(request.type)
            .withPath(request.path)
            .withHeaders(request.headers)
            .withBody({})
            .withBearerToken(true)
            .build();
          return apiRequest;
        })
      );
  }

  private getTypeOf(object) {
    switch (Object.prototype.toString.call(object)) {
      case '[object Uint8Array]':
        return 'Uint8Array';
      default:
        return 'Unknown';
    }
  }
}
