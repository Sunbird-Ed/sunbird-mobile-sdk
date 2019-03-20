import { OAuthSession } from './o-auth-session';
export interface SessionProvider {
    provide(): Promise<OAuthSession>;
}
