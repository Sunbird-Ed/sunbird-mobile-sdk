import {ApiConfig, ApiService, HttpClientError, HttpRequestType, HttpSerializer, Request, Response, ResponseCode} from '../../api';
import {OAuthSession} from '..';
import {AuthKeys} from '../../preference-keys';
import {NoActiveSessionError} from '../../profile';
import {SharedPreferences} from '../../util/shared-preferences';
import {AuthTokenRefreshErrorEvent, ErrorEventType, EventNamespace, EventsBusService} from '../../events-bus';
import {AuthTokenRefreshError} from '../errors/auth-token-refresh-error';
import { JwtUtil } from '../../util/jwt-util';

export class AuthUtil {
    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private sharedPreferences: SharedPreferences,
        private eventsBusService: EventsBusService
    ) {
    }

    public async refreshSession(): Promise<void> {
        let sessionData = await this.getSessionData();

        if (!sessionData) {
            throw new NoActiveSessionError('No Active Sessions found');
        }
        let request ;
        if(window.device.platform.toLowerCase() === "ios"){
            request = new Request.Builder()
            .withPath('/auth/v1/refresh/token')
            .withType(HttpRequestType.POST)
            .withSerializer(HttpSerializer.URLENCODED)
            .withHeaders({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              })
            .withBearerToken(true)
            .withBody({
                refresh_token: sessionData.refresh_token
            })
            .build();
        } else {
            request = new Request.Builder()
            .withPath('/auth/v1/refresh/token')
            .withType(HttpRequestType.POST)
            .withSerializer(HttpSerializer.URLENCODED)
            .withBearerToken(true)
            .withBody({
                refresh_token: sessionData.refresh_token
            })
            .build();
        }

        try {
            await this.apiService.fetch(request).toPromise()
                .catch((e) => {
                    if (HttpClientError.isInstance(e) && e.response.responseCode === ResponseCode.HTTP_BAD_REQUEST) {
                        throw new AuthTokenRefreshError(e.message);
                    }

                    throw e;
                })
                .then(async (response: Response) => {
                    if (response.body.result.access_token && response.body.result.refresh_token) {
                        let playload = await JwtUtil.decodeJWT(response.body.result.access_token);
                        const jwtPayload: { sub: string, exp: number } = JSON.parse(playload);

                        const userToken = jwtPayload.sub.split(':').length === 3 ? <string> jwtPayload.sub.split(':').pop() : jwtPayload.sub;

                        const prevSessionData = await this.getSessionData();

                        sessionData = {
                            ...response.body.result,
                            userToken: prevSessionData ? prevSessionData.userToken : userToken,
                            managed_access_token: prevSessionData ? prevSessionData.managed_access_token : undefined,
                            accessTokenExpiresOn: jwtPayload.exp * 1000
                        };

                        return await this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData)).toPromise();
                    }

                    throw new AuthTokenRefreshError('No token found in server response');
                });
        } catch (e) {
            if (e instanceof AuthTokenRefreshError) {
                this.eventsBusService.emit({
                    namespace: EventNamespace.ERROR,
                    event: {
                        type: ErrorEventType.AUTH_TOKEN_REFRESH_ERROR,
                        payload: e
                    } as AuthTokenRefreshErrorEvent
                });
            }

            throw e;
        }
    }

    public async startSession(sessionData: OAuthSession): Promise<void> {
        await this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData)).toPromise();
    }

    public async endSession(): Promise<void> {
        await this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, '').toPromise();
    }

    public async getSessionData(): Promise<OAuthSession | undefined> {
        const stringifiedSessionData = await this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION).toPromise();

        if (!stringifiedSessionData) {
            return undefined;
        }

        return JSON.parse(stringifiedSessionData);
    }
}
