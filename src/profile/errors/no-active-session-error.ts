import {SunbirdError} from '../../sunbird-error';

export class NoActiveSessionError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_ACTIVE_SESSION');

        Object.setPrototypeOf(this, NoActiveSessionError.prototype);
    }
}
