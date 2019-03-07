import {SunbirdError} from '../../sunbird-error';

export class NoGroupFoundError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_GROUP_FOUND');

        Object.setPrototypeOf(this, NoGroupFoundError.prototype);
    }
}
