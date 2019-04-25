import {SunbirdError} from '../../sunbird-error';

export class SignInError extends SunbirdError {
    constructor(message: string) {
        super(message, 'SIGN_IN_ERROR');

        Object.setPrototypeOf(this, SignInError.prototype);
    }
}
