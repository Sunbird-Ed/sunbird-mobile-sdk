import {Connection} from '../connection';
import {SessionData} from './session-data';

export interface UserAuthService {
    refreshSession(connection: Connection): Promise<SessionData>;

    startSession(sessionData: SessionData);

    endSession();

    getSessionData(): Promise<SessionData>
}