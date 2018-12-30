import {Connection} from '../connection';

export interface UserAuthService {
    refreshSessionToken(connection: Connection): Promise<{
        accessToken: string,
        userToken: string,
        refreshToken: string
    }>;
}