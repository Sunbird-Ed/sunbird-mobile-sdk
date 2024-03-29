import {SessionProvider} from '../../../def/session-provider';
import {Observable} from 'rxjs';
import {ApiService, HttpRequestType, JWTUtil, Request} from '../../../../api';
import {map} from 'rxjs/operators';
import {OAuthSession} from '../../../def/o-auth-session';
import {SunbirdSdk} from '../../../../sdk';
import {CsModule} from '@project-sunbird/client-services';

export interface NativeAppleTokens {
    email: string;
    authorizationCode: string;
    state: string;
    identityToken: string;
    fullName: {
        nickname: string;
        phoneticRepresentation: string;
        middleName: string
        familyName: string;
        namePrefix: string;
        givenName: string;
        nameSuffix: string;
    };
    user: string;
}

export class NativeAppleSessionProvider implements SessionProvider {

    private static readonly LOGIN_API_ENDPOINT = '/apple/auth/ios';
    private apiService: ApiService;

    private static parseAccessToken(accessToken: string): {
        userToken: string;
        accessTokenExpiresOn: number;
    } {
        const payload: { sub: string, exp: number } = JWTUtil.getJWTPayload(accessToken);
        return {
            userToken: payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub,
            accessTokenExpiresOn: payload.exp * 1000
        };
    }

    constructor(
        private nativeAppleTokenProvider: () => Promise<NativeAppleTokens>
    ) {
        this.apiService = SunbirdSdk.instance.apiService;
        console.log(this.apiService);
    }

    async provide(): Promise<OAuthSession> {
        const appleSignInRes = await this.nativeAppleTokenProvider();
        return this.callAppleNativeLogin(appleSignInRes).toPromise();
    }

    private callAppleNativeLogin(appleSignInRes): Observable<OAuthSession> {
        const platform = window.device.platform.toLowerCase() === 'ios' ? 'ios' : null;
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(NativeAppleSessionProvider.LOGIN_API_ENDPOINT)
            .withBearerToken(false)
            .withUserToken(false)
            .withBody({
                emailId: appleSignInRes.email,
                platform,
                ...appleSignInRes
            })
            .build();
        return this.apiService.fetch<{ sessionId: { access_token: string, refresh_token: string }}>(apiRequest)
            .pipe(
                map((success) => {
                    if (success.body) {
                        CsModule.instance.updateAuthTokenConfig(success.body.sessionId.access_token);
                    }
                    return {
                        access_token: success.body.sessionId.access_token,
                        refresh_token: success.body.sessionId.refresh_token,
                        userToken: NativeAppleSessionProvider.parseAccessToken(success.body.sessionId.access_token).userToken
                    };
                })
            );
    }
}
