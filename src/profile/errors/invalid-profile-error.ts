import {SunbirdError} from '../../sunbird-error';

export class InvalidProfileError extends SunbirdError {
    constructor(message: string) {
        super(message, 'INVALID_PROFILE_ERROR');

        Object.setPrototypeOf(this, InvalidProfileError.prototype);
    }
}
