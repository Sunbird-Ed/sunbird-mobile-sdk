import { OauthSession } from './oauth-session';
export interface SessionProvider {
    provide(): Promise<OauthSession>;
}
