import {SessionProvider} from '../../../def/session-provider';
import {Observable} from 'rxjs';
import {ApiService, HttpRequestType, Request} from '../../../../api';
import {map} from 'rxjs/operators';
import {OAuthSession} from '../../../def/o-auth-session';
import {SunbirdSdk} from '../../../../sdk';
import {CsModule} from '@project-sunbird/client-services';
import { JwtUtil } from '../../../../util/jwt-util';

export interface NativeGoogleTokens {
    idToken: string;
    email: string;
}

export class NativeGoogleSessionProvider implements SessionProvider {

    private static readonly LOGIN_API_ENDPOINT = '/google/auth/android';
    private apiService: ApiService;

    private static async parseAccessToken(accessToken: string): Promise<{
        userToken: string;
        accessTokenExpiresOn: number;
    }> {
        let decodeToken = await JwtUtil.decodeJWT(accessToken);
        const payload: { sub: string, exp: number } = JSON.parse(decodeToken);
        return {
            userToken: payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub,
            accessTokenExpiresOn: payload.exp * 1000
        };
    }

    constructor(
        private nativeGoogleTokenProvider: () => Promise<NativeGoogleTokens>
    ) {
        this.apiService = SunbirdSdk.instance.apiService;
    }

    async provide(): Promise<OAuthSession> {
        const nativeGoogleToken = await this.nativeGoogleTokenProvider();
        return this.callGoogleNativeLogin(nativeGoogleToken.idToken, nativeGoogleToken.email).toPromise();
    }

    private callGoogleNativeLogin(idToken: string, emailId: string): Observable<any> {
        const platform = window.device.platform.toLowerCase() ==='ios' ? 'ios' :null;
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(NativeGoogleSessionProvider.LOGIN_API_ENDPOINT)
            .withBearerToken(false)
            .withUserToken(false)
            .withBody({
                emailId: emailId,
                platform: platform
            })
            .withHeaders({
                'X-GOOGLE-ID-TOKEN': idToken
            })
            .build();
        return this.apiService.fetch<{ access_token: string, refresh_token: string }>(apiRequest)
            .pipe(
                map(async (success) => {
                    if (success.body) {
                        CsModule.instance.updateAuthTokenConfig(success.body.access_token);
                    }
                    return {
                        access_token: success.body.access_token,
                        refresh_token: success.body.refresh_token,
                        userToken: (await NativeGoogleSessionProvider.parseAccessToken(success.body.access_token)).userToken
                    };
                })
            );
    }
}
