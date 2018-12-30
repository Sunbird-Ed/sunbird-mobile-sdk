import {Connection} from '../connection';

export interface ApiAuthService {
    refreshAuthToken(connection: Connection): Promise<string>;
}