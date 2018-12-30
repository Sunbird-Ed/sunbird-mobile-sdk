import {UserAuthService} from '../../def/auth/user-auth-Service';
import {ApiConfig, Connection} from '../..';

export class MobileUserAuthService implements UserAuthService {
    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    refreshSessionToken(connection: Connection): Promise<{ userToken: string; refreshToken: string }> {
        return new Promise<{ userToken: string, refreshToken: string }>((resolve, reject) => {
            // TODO
        });
    }
}