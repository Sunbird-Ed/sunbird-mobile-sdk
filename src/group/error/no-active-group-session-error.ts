import {SunbirdError} from '../../sunbird-error';

export class NoActiveGroupSessionError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_ACTIVE_SESSION');

        Object.setPrototypeOf(this, NoActiveGroupSessionError.prototype);
    }
}
