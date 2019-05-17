import {SunbirdError} from '../../sunbird-error';

export class AuthTokenRefreshError extends SunbirdError {
    constructor(message: string) {
        super(message, 'AUTH_TOKEN_REFRESH_ERROR');

        Object.setPrototypeOf(this, AuthTokenRefreshError.prototype);
    }
}
