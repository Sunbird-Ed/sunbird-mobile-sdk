import {SunbirdError} from '../../sunbird-error';

export class CancelationError extends SunbirdError {
    constructor(message: string) {
        super(message, 'CANCELLED');

        Object.setPrototypeOf(this, CancelationError.prototype);
    }
}
