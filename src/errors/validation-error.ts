import {SunbirdError} from '../sunbird-error';

export class ValidationError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NETWORK_ERROR');

        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
