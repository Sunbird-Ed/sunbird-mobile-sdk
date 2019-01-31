import { SessionProvider } from '../def/session-provider';
import { OauthSession } from '../def/oauth-session';
export declare class GoogleSessionProvider implements SessionProvider {
    createSession(args: any): Promise<OauthSession>;
}
