import {SunbirdError} from '../../sunbird-error';

export class NoProfileFoundError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_PROFILE_FOUND');

        Object.setPrototypeOf(this, NoProfileFoundError.prototype);
    }
}
