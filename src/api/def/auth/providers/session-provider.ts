import {SessionData} from '../session-data';

export interface SessionProvider {
    createSession(accessToken: string, refreshToken?: string): Promise<SessionData>;
}