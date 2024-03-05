import { SessionProvider } from '../../../def/session-provider';
import { Observable } from 'rxjs';
import { ApiService, HttpRequestType, Request, ApiConfig} from '../../../../api';
import { map } from 'rxjs/operators';
import { SunbirdSdk } from '../../../../sdk';
import { CsModule } from '@project-sunbird/client-services';
import { WebviewSessionProviderConfig } from '../../webview-session-provider/def/webview-session-provider-config';
import { JwtUtil } from '../../../../util/jwt-util';

export interface NativeKeycloakTokens {
    username: string;
    password: string;
}

export class NativeKeycloakSessionProvider implements SessionProvider {
    private static readonly LOGIN_API_ENDPOINT = '/keycloak/login';
    private apiService: ApiService;
    protected apiConfig: ApiConfig;
    
    private static async parseAccessToken(accessToken: string): Promise<{
        userToken: string;
        accessTokenExpiresOn: number;
    }> {
        let decodeToken = await JwtUtil.decodeJWT(accessToken)
        const payload: { sub: string, exp: number } = JSON.parse(decodeToken);
        return {
            userToken: payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub,
            accessTokenExpiresOn: payload.exp * 1000
        };
    }
    
    constructor(
        private loginConfig: WebviewSessionProviderConfig,
        private nativeKeycloakTokenProvider: NativeKeycloakTokens
    ) {
        this.apiService = SunbirdSdk.instance.apiService;
    }

    async provide(): Promise<any> {
        return this.callKeycloakNativeLogin(this.nativeKeycloakTokenProvider.username, this.nativeKeycloakTokenProvider.password).toPromise();
    }

    private callKeycloakNativeLogin(emailId: string, password: string): Observable<any> {
        const platform = window.device.platform.toLowerCase() ==='ios' ? 'ios' : window.device.platform.toLowerCase();
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(NativeKeycloakSessionProvider.LOGIN_API_ENDPOINT)
            .withBearerToken(false)
            .withUserToken(false)
            .withBody({
                client_id: platform,
                emailId: emailId,
                password: password,
                loginConfig: this.loginConfig.target
            })
            .build();
        return this.apiService.fetch<{ access_token: string, refresh_token: string }>(apiRequest)
            .pipe(
                map(async (success) => {
                    if (success?.body?.access_token) {
                        CsModule.instance.updateAuthTokenConfig(success.body.access_token);
                        return {
                            access_token: success.body.access_token,
                            refresh_token: success.body.refresh_token,
                            userToken: (await NativeKeycloakSessionProvider.parseAccessToken(success.body.access_token)).userToken
                        };
                    } else {
                        return success.body;
                    }
                })
            );
    }
}
