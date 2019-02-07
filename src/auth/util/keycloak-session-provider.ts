import {OauthSession, SessionProvider} from '..';

export class KeycloakSessionProvider implements SessionProvider {
    provide(): Promise<OauthSession> {
        // TODO: Subranil
        throw new Error('To be implemented');
    }
}
