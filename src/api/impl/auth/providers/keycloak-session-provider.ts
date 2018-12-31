import {SessionProvider} from '../../../def/auth/providers/session-provider';
import {SessionData} from '../../../def/auth/session-data';
import {ApiSdk} from '../../../api-sdk';
import {ApiConfig, Request, REQUEST_TYPE, Response} from '../../..';

export class KeycloakSessionProvider implements SessionProvider {
    constructor(private apiConfig: ApiConfig) {
    }

    public async createSession(accessToken: string): Promise<SessionData> {
        const response: Response = await ApiSdk.instance.fetch(new Request(
            this.apiConfig.user_authentication.authUrl,
            REQUEST_TYPE.POST,
            null,
            JSON.stringify({
                redirect_uri: this.apiConfig.baseUrl + '/' + this.apiConfig.user_authentication.redirectUrl,
                code: this.parseUserTokenFromAccessToken(accessToken),
                grant_type: 'authorization_code',
                client_id: 'android'
            }))
        );

        const sessionData = JSON.parse(response.response());

        return sessionData;
    }

    private parseUserTokenFromAccessToken(accessToken: string): string {
        // TODO
        return '';
    }
}